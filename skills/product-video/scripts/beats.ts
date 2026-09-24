#!/usr/bin/env bun
/**
 * beats.ts — music analysis for beat-synced video cuts.
 *
 * Decodes an audio file (any format ffmpeg reads) to mono PCM, then computes:
 *   - a spectral-flux onset strength envelope        (Ellis 2007, §3.1)
 *   - a global tempo estimate                        (autocorrelation + parabolic interpolation)
 *   - beat times                                      (Ellis 2007 dynamic-programming beat tracker)
 *   - downbeats                                       (phase of the 4 beats/bar with the most bass energy)
 *   - bars / phrases                                  (4/8/16-bar grouping, snapped to structural boundaries)
 *   - sections + the drop(s)                          (RMS/onset novelty, Foote 2000 checkerboard kernel)
 *   - a raw onset list                                (fine-grained, for taps/hits finer than the beat grid)
 *
 * No Python, no numpy — everything here (FFT, mel filterbank, autocorrelation, the DP
 * beat tracker, the checkerboard novelty kernel) is implemented from the cited papers
 * in plain TypeScript, run under Bun. ffmpeg is used only to decode audio to PCM.
 *
 * Primary sources:
 *   - Ellis, D.P.W. "Beat Tracking by Dynamic Programming." Journal of New Music
 *     Research 36.1 (2007): 51-60. https://www.ee.columbia.edu/~dpwe/pubs/Ellis07-beattrack.pdf
 *     Onset envelope: §3.1 (32ms STFT window / 4ms hop, 40 Mel bands, dB, first-order
 *     difference, half-wave rectify, sum bands, 0.4Hz high-pass, ~20ms Gaussian smooth,
 *     normalize by std). DP recurrence: eq. (1)-(4), reproduced in trackBeats() below.
 *   - librosa docs (librosa.beat.beat_track, librosa.onset.onset_strength) for the
 *     "tightness" parameterisation of the same recurrence and standard defaults.
 *     https://librosa.org/doc/0.11.0/generated/librosa.beat.beat_track.html
 *   - Foote, J. "Automatic Audio Segmentation Using a Measure of Audio Novelty." ICME 2000.
 *     Self-similarity matrix + checkerboard-kernel novelty curve for structural boundaries.
 *
 * Usage:
 *   bun beats.ts <audio-file>                          full JSON analysis to stdout
 *   bun beats.ts <audio-file> --snap <seconds>          nearest beat/downbeat to a time
 *   bun beats.ts <audio-file> --plan <n> [--near <s>]   n cut points on downbeats that
 *                                                        build into the biggest drop
 */

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

type Section = {
  start: number;
  end: number;
  energy: number; // 0-1, mean RMS of the section normalized to the track's peak RMS
  label: 'intro' | 'build' | 'drop' | 'break' | 'outro';
};

type Phrase = { start: number; bars: number };

type Analysis = {
  bpm: number;
  beatPeriod: number; // seconds per beat, 60 / bpm
  beats: number[]; // seconds
  downbeats: number[]; // seconds, subset of beats
  bars: number[]; // seconds, one per bar == downbeats (bar starts at its downbeat)
  phrases: Phrase[];
  sections: Section[];
  drops: number[]; // seconds, start of every section labeled 'drop'
  onsets: number[]; // seconds, fine-grained onset peaks (finer than the beat grid)
};

// ────────────────────────────────────────────────────────────────────────────
// Audio decode (ffmpeg → mono f32 PCM)
// ────────────────────────────────────────────────────────────────────────────

const SR = 22050; // decode rate. Ellis resamples to 8kHz for the onset front-end;
// we keep a higher rate for the mel filterbank's frequency resolution and reuse the
// same signal for RMS/novelty, but cap the mel filterbank at 8kHz (see onsetEnvelope()).

function decodePCM(file: string): Float32Array {
  const r = Bun.spawnSync(
    ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', 'pipe:1'],
    { stdout: 'pipe', stderr: 'pipe' },
  );
  if (r.exitCode !== 0) {
    throw new Error(`ffmpeg failed to decode ${file}: ${r.stderr.toString()}`);
  }
  const buf = r.stdout;
  const floats = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
  // copy out of the spawn's buffer so it can be garbage collected independently
  return Float32Array.from(floats);
}

// ────────────────────────────────────────────────────────────────────────────
// FFT — iterative radix-2 Cooley-Tukey, in place, on parallel real/imag arrays
// ────────────────────────────────────────────────────────────────────────────

function fft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  // bit-reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      let t = re[i]; re[i] = re[j]; re[j] = t;
      t = im[i]; im[i] = im[j]; im[j] = t;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curWr = 1, curWi = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * curWr - im[i + k + len / 2] * curWi;
        const vi = re[i + k + len / 2] * curWi + im[i + k + len / 2] * curWr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const nWr = curWr * wr - curWi * wi;
        curWi = curWr * wi + curWi * wr;
        curWr = nWr;
      }
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Mel filterbank
// ────────────────────────────────────────────────────────────────────────────

const hzToMel = (f: number) => 2595 * Math.log10(1 + f / 700);
const melToHz = (m: number) => 700 * (10 ** (m / 2595) - 1);

/** Triangular mel filterbank, `nBands` filters from 0 Hz to `fMax` Hz, for an FFT of size `fftSize`. */
function melFilterbank(nBands: number, fftSize: number, sr: number, fMax: number) {
  const nBins = fftSize / 2 + 1;
  const melMin = hzToMel(0), melMax = hzToMel(fMax);
  const melPoints = new Float64Array(nBands + 2);
  for (let i = 0; i < melPoints.length; i++) melPoints[i] = melMin + ((melMax - melMin) * i) / (nBands + 1);
  const binPoints = Array.from(melPoints, (m) => Math.floor((melToHz(m) / sr) * fftSize));
  const filters: Float64Array[] = [];
  for (let m = 1; m <= nBands; m++) {
    const f = new Float64Array(nBins);
    const left = binPoints[m - 1], center = binPoints[m], right = binPoints[m + 1];
    for (let k = left; k < center; k++) if (k >= 0 && k < nBins && center > left) f[k] = (k - left) / (center - left);
    for (let k = center; k < right; k++) if (k >= 0 && k < nBins && right > center) f[k] = (right - k) / (right - center);
    filters.push(f);
  }
  return filters;
}

// ────────────────────────────────────────────────────────────────────────────
// STFT pass — shared by the onset envelope, the bass-energy track (for downbeats)
// and the coarse mel/RMS feature series (for section novelty)
// ────────────────────────────────────────────────────────────────────────────

const FFT_SIZE = 1024;
const WIN_SAMPLES = Math.round(0.032 * SR); // ≈32ms, per Ellis §3.1
const HOP_SAMPLES = Math.round(0.004 * SR); // ≈4ms, per Ellis §3.1
const FRAME_RATE = SR / HOP_SAMPLES; // ≈250 Hz, matches Ellis's 4ms/250Hz grid
const N_MEL = 40; // per Ellis §3.1
const MEL_FMAX = 8000; // Ellis resamples to 8kHz before the mel step; we cap the filterbank instead

function hann(n: number) {
  const w = new Float64Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
  return w;
}

/** Returns per-frame mel-band log-energies: melLog[frame][band]. */
function stftMelLog(pcm: Float32Array): Float64Array[] {
  const window = hann(WIN_SAMPLES);
  const filters = melFilterbank(N_MEL, FFT_SIZE, SR, MEL_FMAX);
  const nFrames = Math.max(0, Math.floor((pcm.length - WIN_SAMPLES) / HOP_SAMPLES) + 1);
  const re = new Float64Array(FFT_SIZE);
  const im = new Float64Array(FFT_SIZE);
  const out: Float64Array[] = new Array(nFrames);
  for (let t = 0; t < nFrames; t++) {
    re.fill(0); im.fill(0);
    const start = t * HOP_SAMPLES;
    for (let i = 0; i < WIN_SAMPLES; i++) re[i] = pcm[start + i] * window[i];
    fft(re, im);
    const nBins = FFT_SIZE / 2 + 1;
    const mag = new Float64Array(nBins);
    for (let k = 0; k < nBins; k++) mag[k] = Math.hypot(re[k], im[k]);
    const mel = new Float64Array(N_MEL);
    for (let b = 0; b < N_MEL; b++) {
      let e = 0;
      const f = filters[b];
      for (let k = 0; k < nBins; k++) e += f[k] * mag[k];
      mel[b] = 20 * Math.log10(Math.max(e, 1e-6)); // dB, per Ellis §3.1
    }
    out[t] = mel;
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────────────
// Onset strength envelope — Ellis 2007 §3.1
// ────────────────────────────────────────────────────────────────────────────

function onePoleHighPass(x: Float64Array, cutoffHz: number, fs: number) {
  const a = Math.exp((-2 * Math.PI * cutoffHz) / fs);
  const y = new Float64Array(x.length);
  let prevX = x[0], prevY = 0;
  for (let i = 0; i < x.length; i++) {
    y[i] = x[i] - prevX + a * prevY;
    prevX = x[i]; prevY = y[i];
  }
  return y;
}

function gaussianKernel(sigmaFrames: number) {
  const radius = Math.max(1, Math.round(sigmaFrames * 3));
  const k = new Float64Array(2 * radius + 1);
  let sum = 0;
  for (let i = -radius; i <= radius; i++) {
    const v = Math.exp(-(i * i) / (2 * sigmaFrames * sigmaFrames));
    k[i + radius] = v; sum += v;
  }
  for (let i = 0; i < k.length; i++) k[i] /= sum;
  return k;
}

function convolveSame(x: Float64Array, k: Float64Array) {
  const radius = (k.length - 1) / 2;
  const y = new Float64Array(x.length);
  for (let i = 0; i < x.length; i++) {
    let s = 0;
    for (let j = -radius; j <= radius; j++) {
      const idx = i + j;
      if (idx >= 0 && idx < x.length) s += x[idx] * k[j + radius];
    }
    y[i] = s;
  }
  return y;
}

function stdDev(x: Float64Array) {
  let m = 0;
  for (const v of x) m += v;
  m /= x.length;
  let s = 0;
  for (const v of x) s += (v - m) ** 2;
  return Math.sqrt(s / x.length);
}

/** Onset strength envelope, and the parallel bass-energy track used for downbeat phase. */
function onsetEnvelope(mel: Float64Array[]) {
  const nFrames = mel.length;
  const raw = new Float64Array(nFrames);
  const bass = new Float64Array(nFrames); // sum of the bottom ~5 mel bands (<~500Hz), per frame
  const N_BASS_BANDS = 5;
  for (let t = 1; t < nFrames; t++) {
    let sum = 0;
    for (let b = 0; b < N_MEL; b++) {
      const d = mel[t][b] - mel[t - 1][b];
      if (d > 0) sum += d; // half-wave rectify
    }
    raw[t] = sum;
    let bassE = 0;
    for (let b = 0; b < N_BASS_BANDS; b++) bassE += mel[t][b];
    bass[t] = bassE;
  }
  raw[0] = raw[1] ?? 0;
  bass[0] = bass[1] ?? 0;

  const hp = onePoleHighPass(raw, 0.4, FRAME_RATE); // 0.4Hz cutoff, per Ellis §3.1
  const sigmaFrames = 0.02 * FRAME_RATE; // ~20ms Gaussian smoothing, per Ellis §3.1
  const smoothed = convolveSame(hp, gaussianKernel(sigmaFrames));
  const sd = stdDev(smoothed) || 1;
  const normalized = smoothed.map((v) => v / sd); // normalize by std, per Ellis §3.1
  return { envelope: normalized as unknown as Float64Array, bass };
}

// ────────────────────────────────────────────────────────────────────────────
// Tempo estimation — autocorrelation of the onset envelope + parabolic interpolation
// ────────────────────────────────────────────────────────────────────────────

function autocorrelate(x: Float64Array, minLag: number, maxLag: number) {
  const mean = x.reduce((a, b) => a + b, 0) / x.length;
  const centered = x.map((v) => v - mean);
  const ac = new Float64Array(maxLag - minLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = 0; i + lag < centered.length; i++) s += centered[i] * centered[i + lag];
    ac[lag - minLag] = s;
  }
  return ac;
}

/** Parabolic interpolation around index `i` of array `y`, returning the sub-sample offset. */
function parabolicOffset(y: Float64Array, i: number) {
  if (i <= 0 || i >= y.length - 1) return 0;
  const [a, b, c] = [y[i - 1], y[i], y[i + 1]];
  const denom = a - 2 * b + c;
  if (denom === 0) return 0;
  return (0.5 * (a - c)) / denom;
}

function estimateTempo(envelope: Float64Array) {
  const BPM_MIN = 60, BPM_MAX = 200;
  const minLag = Math.max(1, Math.round((60 / BPM_MAX) * FRAME_RATE));
  const maxLag = Math.round((60 / BPM_MIN) * FRAME_RATE);
  const ac = autocorrelate(envelope, minLag, maxLag);

  // Bias toward a plausible dance/pop tempo with a log-normal prior (as librosa's
  // start_bpm/std_bpm tempo prior does), centered at 120 BPM, 1 octave std, as a
  // tie-breaker — it does not override a clearly stronger peak elsewhere.
  const priorCenter = 120, priorSigmaOctaves = 1.0;
  let bestIdx = 0, bestScore = -Infinity;
  for (let i = 0; i < ac.length; i++) {
    const lag = minLag + i;
    const bpm = (60 * FRAME_RATE) / lag;
    const z = Math.log2(bpm / priorCenter) / priorSigmaOctaves;
    const prior = Math.exp(-0.5 * z * z);
    const score = ac[i] * prior;
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }
  const offset = parabolicOffset(ac, bestIdx);
  const refinedLag = minLag + bestIdx + offset;
  const bpm = Math.round(((60 * FRAME_RATE) / refinedLag) * 10) / 10; // report to 0.1 BPM
  return { bpm, periodFrames: (60 * FRAME_RATE) / bpm };
}

// ────────────────────────────────────────────────────────────────────────────
// Beat tracking — Ellis 2007 dynamic programming, eq. (1)-(4)
// ────────────────────────────────────────────────────────────────────────────

/**
 * C*(t) = O(t) + max_{τ = t-2p .. t-p/2} { α·F(t-τ, p) + C*(τ) }
 * F(Δt, p) = -(log(Δt/p))²
 * Search window and F() exactly as in Ellis (2007) eq. (2)-(4) and the reference
 * Matlab `beatsimple` listing (fig. 1). `alpha` (their weighting) is parameterised
 * here as `tightness` the way librosa.beat.beat_track does (default 100).
 */
function trackBeats(envelope: Float64Array, periodFrames: number, tightness = 100) {
  const n = envelope.length;
  const cumScore = new Float64Array(n);
  const backlink = new Int32Array(n).fill(-1);
  const searchMin = Math.round(periodFrames / 2);
  const searchMax = Math.round(2 * periodFrames);

  for (let t = 0; t < n; t++) {
    let best = -Infinity, bestTau = -1;
    const lo = Math.max(0, t - searchMax);
    const hi = t - searchMin;
    for (let tau = lo; tau <= hi; tau++) {
      const dt = t - tau;
      const f = -((Math.log(dt / periodFrames)) ** 2);
      const score = tightness * f + cumScore[tau];
      if (score > best) { best = score; bestTau = tau; }
    }
    cumScore[t] = envelope[t] + (bestTau >= 0 ? best : 0);
    backlink[t] = bestTau;
  }

  // start the backtrace from the largest cumulative score, as Ellis does
  let end = 0;
  for (let t = 1; t < n; t++) if (cumScore[t] > cumScore[end]) end = t;

  const beatsRev: number[] = [];
  let cur = end;
  while (cur >= 0) {
    beatsRev.push(cur);
    cur = backlink[cur];
  }
  return beatsRev.reverse();
}

// ────────────────────────────────────────────────────────────────────────────
// Downbeats — the beat-grid phase (of 4) whose beats carry the most bass energy
// ────────────────────────────────────────────────────────────────────────────

function pickDownbeats(beatFrames: number[], bass: Float64Array, beatsPerBar = 4) {
  const sums = new Array(beatsPerBar).fill(0);
  for (let i = 0; i < beatFrames.length; i++) sums[i % beatsPerBar] += bass[beatFrames[i]] ?? 0;
  let phase = 0, best = -Infinity;
  for (let p = 0; p < beatsPerBar; p++) if (sums[p] > best) { best = sums[p]; phase = p; }
  return beatFrames.filter((_, i) => i % beatsPerBar === phase);
}

// ────────────────────────────────────────────────────────────────────────────
// Onset peak picking — fine-grained onsets, independent of the beat grid
// ────────────────────────────────────────────────────────────────────────────

function pickOnsetPeaks(envelope: Float64Array, minSpacingFrames: number) {
  const window = Math.round(FRAME_RATE * 0.5); // local stats over ~0.5s
  const peaks: number[] = [];
  let lastPeak = -Infinity;
  for (let i = 1; i < envelope.length - 1; i++) {
    if (envelope[i] <= envelope[i - 1] || envelope[i] < envelope[i + 1]) continue;
    const lo = Math.max(0, i - window), hi = Math.min(envelope.length, i + window);
    let mean = 0;
    for (let j = lo; j < hi; j++) mean += envelope[j];
    mean /= hi - lo;
    let sd = 0;
    for (let j = lo; j < hi; j++) sd += (envelope[j] - mean) ** 2;
    sd = Math.sqrt(sd / (hi - lo));
    if (envelope[i] > mean + 1.2 * sd && i - lastPeak >= minSpacingFrames) {
      peaks.push(i);
      lastPeak = i;
    }
  }
  return peaks;
}

// ────────────────────────────────────────────────────────────────────────────
// Sections — RMS/onset novelty via a Foote (2000) checkerboard kernel
// ────────────────────────────────────────────────────────────────────────────

const COARSE_HOP_SECONDS = 0.25;

function coarseFeatures(mel: Float64Array[], pcm: Float32Array) {
  const framesPerCoarse = Math.round(COARSE_HOP_SECONDS * FRAME_RATE);
  const nCoarse = Math.floor(mel.length / framesPerCoarse);
  const feats: Float64Array[] = [];
  const rms: number[] = [];
  for (let c = 0; c < nCoarse; c++) {
    const lo = c * framesPerCoarse, hi = Math.min(mel.length, lo + framesPerCoarse);
    const v = new Float64Array(N_MEL);
    for (let t = lo; t < hi; t++) for (let b = 0; b < N_MEL; b++) v[b] += mel[t][b];
    for (let b = 0; b < N_MEL; b++) v[b] /= hi - lo;
    feats.push(v);
    // RMS over the matching PCM span
    const sLo = Math.round(lo * HOP_SAMPLES), sHi = Math.min(pcm.length, Math.round(hi * HOP_SAMPLES));
    let sq = 0;
    for (let s = sLo; s < sHi; s++) sq += pcm[s] * pcm[s];
    rms.push(Math.sqrt(sq / Math.max(1, sHi - sLo)));
  }
  return { feats, rms, framesPerCoarse };
}

function cosine(a: Float64Array, b: Float64Array) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Foote (2000) tapered checkerboard kernel of half-width `radius`. */
function checkerboardKernel(radius: number) {
  const size = 2 * radius + 1;
  const k = new Float64Array(size * size);
  const sigma = radius / 2;
  for (let di = -radius; di <= radius; di++) {
    for (let dj = -radius; dj <= radius; dj++) {
      const sign = (di >= 0 ? 1 : -1) * (dj >= 0 ? 1 : -1);
      const taper = Math.exp(-(di * di + dj * dj) / (2 * sigma * sigma));
      k[(di + radius) * size + (dj + radius)] = sign * taper;
    }
  }
  return { k, size, radius };
}

function noveltyCurve(feats: Float64Array[], radiusSeconds: number, hopSeconds: number) {
  const n = feats.length;
  const radius = Math.max(2, Math.round(radiusSeconds / hopSeconds));
  const { k, size } = checkerboardKernel(radius);
  // similarity cache row-by-row is O(n * radius) rather than a full n×n matrix
  const novelty = new Float64Array(n);
  for (let t = 0; t < n; t++) {
    if (t < radius || t >= n - radius) { novelty[t] = 0; continue; }
    let sum = 0;
    for (let di = -radius; di <= radius; di++) {
      for (let dj = -radius; dj <= radius; dj++) {
        const sim = cosine(feats[t + di], feats[t + dj]);
        sum += k[(di + radius) * size + (dj + radius)] * sim;
      }
    }
    novelty[t] = sum;
  }
  return novelty;
}

function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function pickNoveltyBoundaries(novelty: Float64Array, minSpacingFrames: number) {
  const vals = Array.from(novelty);
  const med = median(vals);
  const mad = median(vals.map((v) => Math.abs(v - med))) || 1e-9;
  const threshold = med + 1.5 * mad;
  const peaks: number[] = [];
  let last = -Infinity;
  for (let i = 1; i < novelty.length - 1; i++) {
    if (novelty[i] > novelty[i - 1] && novelty[i] >= novelty[i + 1] && novelty[i] > threshold && i - last >= minSpacingFrames) {
      peaks.push(i);
      last = i;
    }
  }
  return peaks;
}

function nearest(arr: number[], target: number) {
  if (arr.length === 0) return target;
  let best = arr[0], bd = Math.abs(arr[0] - target);
  for (const v of arr) { const d = Math.abs(v - target); if (d < bd) { bd = d; best = v; } }
  return best;
}

// ────────────────────────────────────────────────────────────────────────────
// Full analysis pipeline
// ────────────────────────────────────────────────────────────────────────────

function analyze(file: string): Analysis {
  const pcm = decodePCM(file);
  const durationSeconds = pcm.length / SR;
  const mel = stftMelLog(pcm);
  const { envelope, bass } = onsetEnvelope(mel);

  const { bpm, periodFrames } = estimateTempo(envelope);
  const beatFrames = trackBeats(envelope, periodFrames);
  const downbeatFrames = pickDownbeats(beatFrames, bass);

  const frameToSec = (f: number) => f / FRAME_RATE;
  const beats = beatFrames.map(frameToSec);
  const downbeats = downbeatFrames.map(frameToSec);
  const bars = downbeats;

  const onsetPeakFrames = pickOnsetPeaks(envelope, Math.round(FRAME_RATE * 0.06));
  const onsets = onsetPeakFrames.map(frameToSec);

  // Sections via RMS/mel novelty (Foote 2000 checkerboard kernel)
  const { feats, rms } = coarseFeatures(mel, pcm);
  const novelty = noveltyCurve(feats, 3, COARSE_HOP_SECONDS); // ~3s radius → ~6s kernel window
  const minSpacingCoarse = Math.round(4 / COARSE_HOP_SECONDS); // boundaries at least 4s apart
  const boundaryCoarse = pickNoveltyBoundaries(novelty, minSpacingCoarse);
  const boundarySeconds = [0, ...boundaryCoarse.map((c) => c * COARSE_HOP_SECONDS), durationSeconds]
    .map((s) => (s === 0 || s === durationSeconds ? s : nearest(downbeats, s)))
    .filter((s, i, arr) => i === 0 || s > arr[i - 1] + 1e-6);

  const maxRms = Math.max(...rms, 1e-9);
  const rmsAt = (sec: number) => {
    const idx = Math.min(rms.length - 1, Math.max(0, Math.round(sec / COARSE_HOP_SECONDS)));
    return rms[idx] / maxRms;
  };
  const onsetDensityAt = (start: number, end: number) => {
    const count = onsets.filter((t) => t >= start && t < end).length;
    return count / Math.max(0.1, end - start);
  };

  const rawSections = [];
  for (let i = 0; i < boundarySeconds.length - 1; i++) {
    const start = boundarySeconds[i], end = boundarySeconds[i + 1];
    const energy = rmsAt((start + end) / 2);
    const density = onsetDensityAt(start, end);
    rawSections.push({ start, end, energy, density });
  }

  const densities = rawSections.map((s) => s.density);
  const energies = rawSections.map((s) => s.energy);
  const zscore = (xs: number[]) => {
    const m = xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
    const sd = stdDev(Float64Array.from(xs)) || 1;
    return xs.map((v) => (v - m) / sd);
  };
  const eZ = zscore(energies), dZ = zscore(densities);
  const score = rawSections.map((_, i) => 0.6 * eZ[i] + 0.4 * dZ[i]);
  const medScore = median(score);

  const sections: Section[] = rawSections.map((s, i) => {
    let label: Section['label'];
    if (i === 0) label = 'intro';
    else if (i === rawSections.length - 1) label = 'outro';
    else {
      const isLocalMax = score[i] >= score[i - 1] && score[i] >= score[i + 1] && score[i] > medScore;
      const isLocalMin = score[i] <= score[i - 1] && score[i] <= score[i + 1] && score[i] < medScore;
      if (isLocalMax) label = 'drop';
      else if (isLocalMin) label = 'break';
      else label = 'build';
    }
    return { start: s.start, end: s.end, energy: Math.round(s.energy * 1000) / 1000, label };
  });

  const drops = sections.filter((s) => s.label === 'drop').map((s) => s.start);

  // Phrases: group bars by the same structural boundaries, snapped to 4/8/16-bar units
  const phrases: Phrase[] = [];
  const boundarySet = new Set(sections.map((s) => Math.round(s.start * 1000)));
  let phraseStartBar = 0;
  for (let i = 0; i <= bars.length; i++) {
    const atBoundary = i === bars.length || boundarySet.has(Math.round(bars[i] * 1000));
    const barsSoFar = i - phraseStartBar;
    const hitUnit = barsSoFar > 0 && (barsSoFar % 16 === 0 || barsSoFar % 8 === 0 || barsSoFar % 4 === 0);
    if ((atBoundary && barsSoFar > 0) || (hitUnit && (barsSoFar === 16 || i === bars.length))) {
      phrases.push({ start: bars[phraseStartBar], bars: barsSoFar });
      phraseStartBar = i;
    }
  }

  return { bpm, beatPeriod: Math.round((60 / bpm) * 1000) / 1000, beats, downbeats, bars, phrases, sections, drops, onsets };
}

// ────────────────────────────────────────────────────────────────────────────
// CLI
// ────────────────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]) {
  const file = argv.find((a) => !a.startsWith('--'));
  const flag = (name: string) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  return { file, snap: flag('snap'), plan: flag('plan'), near: flag('near') };
}

function main() {
  const { file, snap, plan, near } = parseArgs(process.argv.slice(2));
  if (!file) {
    console.error('usage: bun beats.ts <audio-file> [--snap <seconds>] [--plan <n> [--near <seconds>]]');
    process.exit(1);
  }

  const a = analyze(file);

  if (snap !== undefined) {
    const t = parseFloat(snap);
    const nb = nearest(a.beats, t);
    const nd = nearest(a.downbeats, t);
    console.log(JSON.stringify({ input: t, nearestBeat: nb, deltaToBeatSeconds: Math.round((nb - t) * 1000) / 1000, nearestDownbeat: nd, deltaToDownbeatSeconds: Math.round((nd - t) * 1000) / 1000 }, null, 2));
    return;
  }

  if (plan !== undefined) {
    const n = Math.max(1, parseInt(plan, 10));
    const target = near !== undefined ? parseFloat(near) : (a.drops[0] ?? a.sections[a.sections.length - 1]?.start ?? a.downbeats[a.downbeats.length - 1]);
    const hitBar = nearest(a.downbeats, target);
    const hitIdx = a.downbeats.indexOf(hitBar);
    const availableBefore = hitIdx; // downbeats before the hit
    const step = n > 1 ? Math.max(1, Math.floor(availableBefore / (n - 1))) : 1;
    const points: { t: number; bar: number; role: string }[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const idx = Math.max(0, hitIdx - i * step);
      points.push({ t: a.downbeats[idx], bar: idx, role: i === 0 ? 'hit' : 'build' });
    }
    // dedupe (can happen if n exceeds available bars)
    const seen = new Set<number>();
    const deduped = points.filter((p) => (seen.has(p.bar) ? false : (seen.add(p.bar), true)));
    console.log(JSON.stringify({ target, hitTime: hitBar, bpm: a.bpm, points: deduped }, null, 2));
    return;
  }

  console.log(JSON.stringify(a, null, 2));
}

main();
