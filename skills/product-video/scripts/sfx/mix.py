"""Lays chosen sound effects under a film's music and says, in numbers, how each one sits against it.

    ~/.cache/audio-tools/venv/bin/python -I mix.py cues.json
    ~/.cache/audio-tools/venv/bin/python -I mix.py bands track.mp3 10.73 20.6     # where the track is thin, before picking

cues.json:
  {"length": 20.6, "out": "out/audio-film.wav", "report": "out/audio-film.txt",
   "music": {"file": "public/music-full/track.mp3", "start": 10.73, "fade_in": 0.25, "fade_out": 1.0, "gain_db": 0},
   "cues": [{"what": "tap on Play", "at": 2.152, "file": "picks/tap/seg/01-x.wav", "over": 6,
             "anchor": "onset", "cut": 0.25, "fade": 0.05, "hp": 200, "lp": 9000, "reverse": false, "rate": 1.0, "pan": 0.0}]}

at      film time, seconds. `anchor` says which point of the sound lands there: "onset" (default: the first sample
        within 20 dB of the peak), "peak", "end", or seconds into the file.
over    how far the sound stands over the music inside its own band, in dB (default 6). The band is the one of four
        (under 150 Hz, 150 Hz-2 kHz, 2-6 kHz, over 6 kHz) holding most of the sound's energy; it compares the
        loudest 30 ms of the sound with the median 30 ms of the music within 0.6 s either side, 30 ms being about
        the ear's window for picking a click out of a bed. 3 is just heard, 6 is plain, 9 is an accent. Setting the level where the sound lives is what lets it be heard and still sit
        under the music as a whole: a tap needs far less level over a bass line than over hi-hats.
ceil    the most the sound's loudest 100 ms may reach against the median 100 ms of the whole music, in dB (default
        -4, so an effect never tops the track; 100 ms is how long the ear takes to judge loudness);
floor   the least (default -22, so an effect over a hole in the music is not turned down to nothing). When either
        limit moves a cue the report says so. `level` instead of `over` sets the whole-music figure directly.
peak_under  the sound's highest sample stays this many dB under the music's highest (default 6). A click a few
        milliseconds long has little energy for its height, so a short bright sound over a bright track runs into this
        limit and ends BURIED: the answer is another take that lives where the track is thin, not more level.
cut     keep only this many seconds from the anchor, then fade out over `fade`.
hp, lp  high-pass and low-pass in Hz (brick-wall in the spectrum): take the lows off a tap so it leaves the bass alone.
rate    playback speed (2.0 is an octave up and half as long); reverse plays it backwards; pan is -1 left to 1 right.

For every cue the report gives both figures: `own band` (how far over the music where it lives) and `whole` (against
the full music, negative when it sits under it). A cue is flagged BURIED when its own band ends under +3 dB.
"""
import json, os, subprocess, sys
import numpy as np

SR = 48000
BANDS = [(0, 150), (150, 2000), (2000, 6000), (6000, SR // 2)]


def load(path, ss=None, t=None):
    cmd = ['ffmpeg', '-v', 'error'] + (['-ss', str(ss)] if ss is not None else []) + (['-t', str(t)] if t is not None else []) + \
          ['-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def band(x, lo, hi):
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f >= hi)] = 0
    return np.fft.irfft(X, len(x), axis=0)


def win_power(x, w=0.1, hop=0.025):
    """Power of each 100 ms window (both channels together)."""
    n, h = int(w * SR), int(hop * SR)
    p = (x ** 2).sum(1)
    c = np.concatenate([[0.0], np.cumsum(p)])
    idx = np.arange(0, max(1, len(p) - n + 1), h)
    return (c[np.minimum(idx + n, len(p))] - c[idx]) / n


def anchor_of(x, how):
    e = np.abs(x).max(1)
    if how in (None, 'onset'):
        return int(np.argmax(e > 0.1 * e.max()))
    if how == 'peak':
        return int(e.argmax())
    if how == 'end':
        return len(x)
    return int(float(how) * SR)


def resample(x, rate):
    n = int(len(x) / rate)
    t = np.arange(n) * rate
    return np.stack([np.interp(t, np.arange(len(x)), x[:, c]) for c in range(2)], 1)


def main(spec_path):
    spec = json.load(open(spec_path))
    L = spec['length']
    n = int(round(L * SR))
    mu = spec['music']
    music = load(mu['file'], ss=mu.get('start', 0), t=L + 0.5)[:n]
    if len(music) < n:
        music = np.vstack([music, np.zeros((n - len(music), 2))])
    tt = np.arange(n) / SR
    fi, fo = mu.get('fade_in', 0.25), mu.get('fade_out', 1.0)
    music *= (np.clip(tt / max(fi, 1e-3), 0, 1) * np.clip((L - tt) / max(fo, 1e-3), 0, 1) ** mu.get('fade_curve', 1.0))[:, None]
    music *= 10 ** (mu.get('gain_db', 0) / 20)
    mix = music.copy()
    mbands = [band(music, lo, hi) for lo, hi in BANDS]
    m_peak = np.abs(music).max()
    cache, lines = {}, []
    for c in spec['cues']:
        if c['file'] not in cache:
            cache[c['file']] = load(c['file'])
        x = cache[c['file']].copy()
        if c.get('reverse'):
            x = x[::-1].copy()
        if c.get('rate', 1.0) != 1.0:
            x = resample(x, c['rate'])
        if c.get('hp') or c.get('lp'):
            x = band(x, c.get('hp', 0), c.get('lp', SR // 2))
        a0 = anchor_of(x, c.get('anchor'))
        if c.get('cut'):
            x = x[:a0 + int(c['cut'] * SR)].copy()
            k = min(len(x), int(c.get('fade', 0.04) * SR))
            x[-k:] *= np.linspace(1, 0, k)[:, None]
        if c.get('fade_in'):
            k = min(len(x), int(c['fade_in'] * SR))
            x[:k] *= np.linspace(0, 1, k)[:, None]
        pan = c.get('pan', 0.0)
        x = x * np.array([min(1.0, 1 - pan), min(1.0, 1 + pan)])[None, :]
        i = int(round(c['at'] * SR)) - a0
        if i < 0:
            x, i = x[-i:], 0
        x = x[:max(0, n - i)]
        if len(x) < int(0.01 * SR):
            continue
        # the music around the cue: median 100 ms window within 0.6 s either side of where the effect is loudest
        ipk = i + int(np.abs(x).max(1).argmax())
        lo_i, hi_i = max(0, ipk - int(0.6 * SR)), min(n, ipk + int(0.6 * SR))
        m_ref = np.median(win_power(music[lo_i:hi_i])) + 1e-12
        pad = np.vstack([x, np.zeros((max(0, int(0.1 * SR) - len(x)), 2))])
        e_pk = win_power(pad).max() + 1e-12
        # the band the effect lives in, and the gain that puts it `over` dB above the music there
        shares = [float((band(pad, lo, hi) ** 2).sum()) for lo, hi in BANDS]
        b = int(np.argmax(shares))
        e_own = win_power(band(pad, *BANDS[b]), 0.03, 0.01).max() + 1e-15          # 30 ms: the ear's window for hearing a click
        m_own = np.median(win_power(mbands[b][lo_i:hi_i], 0.03, 0.01)) + 1e-15
        note = ''
        if 'level' in c:
            whole = c['level']
        else:
            whole = c.get('over', 6) + 10 * np.log10(m_own / e_own) - 10 * np.log10(m_ref / e_pk)
            lo_lim, hi_lim = c.get('floor', -22), c.get('ceil', -4)
            if whole > hi_lim:
                whole, note = hi_lim, ' (held by its ceiling)'
            elif whole < lo_lim:
                whole, note = lo_lim, ' (raised to its floor)'
        g = 10 ** (whole / 20) * np.sqrt(m_ref / e_pk)
        cap = m_peak * 10 ** (-c.get('peak_under', 6) / 20) / (np.abs(x).max() + 1e-12)   # a click's spike stays under the music's own peaks
        if g > cap:
            whole, g, note = whole + 20 * np.log10(cap / g), cap, ' (held by its peak limit)'
        own = 10 * np.log10(e_own * g * g / m_own)
        mix[i:i + len(x)] += x * g
        flag = ' BURIED' if own < 3 else ''
        lines.append(f"{c['at']:6.2f} s  {c['what']}: {os.path.basename(c['file'])}, own band ({BANDS[b][0]}-{BANDS[b][1]} Hz) {own:+.0f} dB over the music, "
                     f"whole {whole:+.0f} dB{note}, peak {20 * np.log10(np.abs(x).max() * g + 1e-9):.0f} dBFS{flag}")
    out = spec['out']
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-c:a', 'pcm_f32le', out],
                   input=np.clip(mix, -4, 4).astype(np.float32).tobytes(), check=True)
    tail = np.sqrt((mix[-int(0.6 * SR):] ** 2).mean())
    body = np.sqrt((mix[int(2 * SR):-int(2 * SR)] ** 2).mean())
    lines.append(f"last 0.6 s: {20 * np.log10(tail / body + 1e-9):+.1f} dB against the body of the film (music held to the last frame)")
    lines.append(f"mix peak before mastering {20 * np.log10(np.abs(mix).max() + 1e-9):+.1f} dBFS")
    txt = '\n'.join(lines)
    if spec.get('report'):
        open(spec['report'], 'w').write(txt + '\n')
    print(out)
    print(txt)


def bands(path, start=0.0, length=None):
    """Where a track is thin: median level of each band, whole and per 4 s, so effects can be picked to live there."""
    m = load(path, ss=float(start), t=float(length) if length else None)
    print(f'{path}: whole median {10 * np.log10(np.median(win_power(m)) + 1e-15):.1f} dBFS, peak {20 * np.log10(np.abs(m).max() + 1e-9):.1f} dBFS')
    for lo, hi in BANDS:
        b = win_power(band(m, lo, hi))
        per = [10 * np.log10(np.median(b[i:i + 160]) + 1e-15) for i in range(0, len(b) - 80, 160)]
        print(f'  {lo:>5}-{hi:<5} Hz  median {10 * np.log10(np.median(b) + 1e-15):6.1f} dB   each 4 s: ' + ' '.join(f'{x:5.0f}' for x in per))


if __name__ == '__main__':
    if sys.argv[1] == 'bands':
        bands(*sys.argv[2:5])           # mix.py bands <track> [start seconds] [length seconds]
    else:
        main(sys.argv[1])
