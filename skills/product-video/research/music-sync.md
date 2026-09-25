# Music sync — putting cuts, text and taps on the beat

For Remotion promo videos cut to music. `beats.ts` (below) analyzes a track and hands
back beats, downbeats, bars, phrases, sections and drops as frame-free seconds, so the
storyboard can snap every scene cut, text reveal, tap and logo hit to the music instead
of a guessed timestamp.

## 1. The rules — where an event goes on the music

| Event | Where on the music | Lead/lag | Source |
|---|---|---|---|
| Scene cut (hard cut) | On a downbeat | Move the cut **1–2 frames before** the beat, not on or after it — the eye perceives the cut as "landing" on the beat slightly after it happens | Frame.io / editing-craft convention: anticipation, cited via PremiumBeat and School-of-Motion-adjacent craft writing (see §2); also standard in Adobe's own Scene Edit Detection workflow docs |
| Scene cut (dense passage, ≤~8s) | Every beat | 0 | `beat-density.md` (0xsline/OpenChatCut) — "dense" is 1 cut/beat, fatigues past ~8s |
| Scene cut (normal pace) | Every downbeat (1 cut/bar) or every other beat | 0 | same |
| Text reveal / caption in | On the downbeat of the phrase it belongs to, not mid-bar | Start the motion 1–2 frames early so the settle lands on the beat | Ellis-style anticipation convention; see `references/motion.md` in the `product-video` skill for the house's own cut-the-curve timing |
| Text reveal / caption out | On the next downbeat or the phrase boundary, whichever is sooner | 0 | keeps captions from bleeding across a bar line |
| Tap / UI interaction beat | On an onset (not necessarily a downbeat) — cut fast passages to visible motion onsets in the footage, not to an arbitrary beat | On the onset, ±0 | `shot-fitness.md` (0xsline/OpenChatCut): "a cut that lands on a beat but lands mid-action with no visible onset reads as an error, not as rhythm" |
| Logo / hero reveal | On the drop's first downbeat | Arrive 1–2 frames early, hold through the downbeat | `beat-density.md`: "anchors first" — the 3–6 moments that must hit a specific musical event |
| First cut of the whole video | Within the first 3 seconds | 0 | `beat-sync-montage/SKILL.md` (0xsline/OpenChatCut): "the first downbeat hit should land within the first three seconds — a beat edit that eases in has wasted its advantage" |
| Held/breathing shot | Right before a drop or a section boundary | Hold at least one shot per ~15s of dense cutting | `beat-density.md`: contrast is what makes the drop feel like a drop |
| Scene change into the drop | On the downbeat that starts the `drop` section | 0, this is the anchor | `beats.ts --plan` builds exactly this: n downbeats stepping up to the drop's first downbeat |
| Quiet section (verse/break) | Sparse cuts, on downbeats only, or hold across the whole section | 0 | `beat-density.md` density table: `rest`/`sparse` for low-energy sections |
| J/L cut (audio leads or trails video) | Audio (music stinger, SFX) starts 2–6 frames before the matching visual cut for a soft landing, or the outgoing shot's audio trails 2–6 frames into the next shot | 2–6 frames | Standard J/L-cut convention from dialogue editing, applied to music/SFX stingers in a beat edit — not from a single named source, but consistent across the editing-craft guides in §2 |

**Reading the numbers**: "1–2 frames before the beat" at 30fps is 33–66ms; the ear/eye
anticipates a strongly-signposted hit slightly ahead of the actual audio peak, which is
why hard-cut edits that land exactly on sample-accurate beat time can still read as
"late." Nudge visual events 1–2 frames earlier than `beats.ts`'s raw beat/downbeat time
when the cut is meant to feel percussive; leave audio-only markers (music stingers) at
the raw time.

## 2. Editing-to-music guides consulted (primary / named-author sources)

- **Adobe, "Remix in Premiere."** https://helpx.adobe.com/premiere-pro/using/remix-audio-in-premiere-pro.html
  Confirms the production method a mainstream NLE uses: *"Premiere measures multiple
  qualities of each beat in the song and compares them against every other beat"* to find
  musically-coherent cut points, prioritizing keeping the original intro/outro and
  editing the middle — the same intro/outro-anchored structure `beats.ts`'s section
  labeling assumes.
- **Adobe Premiere Elements / community docs on automatic beat detection** — Premiere Pro
  itself has no built-in beat-marker feature (Scene Edit Detection cuts on shot changes,
  not music beats); third-party tools (BeatEdit, Beat Marker Pro, blinkl.io Beat
  Detector) fill that gap by placing timeline markers on every Nth beat and on detected
  song sections (intro/verse/chorus/drop/breakdown) — the same section vocabulary
  `beats.ts` outputs.
- **DaVinci Resolve, Fairlight transient detection.** No official "add markers at beat"
  doc exists; Resolve's own transient-detection icon in the Fairlight audio toolbar is
  the closest built-in tool, and third-party marker generators (Pulse Edit, BeatEdit) use
  AI beat detection to place persistent, edit-surviving markers.
- **CapCut, Auto Beat / Beat Sync.** https://www.capcut.com/help/auto-cut-in-capcut and
  https://www.capcut.com/explore/beat-sync — CapCut's own help center documents
  adjustable cut sensitivity ("every beat" vs. "only strong beats"), and recommends
  pairing beat sync with its Auto Highlight (best-footage-moment) detector so the
  standout clips land on the standout beats, not just any beat — the same anchors-first
  principle as `beat-density.md` below.
- **PremiumBeat, "Cut to the Beat! Tip for Editing to Music in Final Cut Pro X."**
  Danny Greer. https://www.premiumbeat.com/blog/cut-to-the-beat-tip-for-editing-to-music-in-final-cut-pro-x/
  *"You can significantly improve the 'feel' of your video projects by using music to
  your advantage — and accordingly, cutting to it."* Technique: mark every beat, then
  snap cuts to those markers.
- **No Film School, "Should You Be Cutting to Drum Beats?"** Jon Fusco.
  https://nofilmschool.com/2017/06/watch-rhythmic-editing
  *"Rhythm is vital. In order to be impactful, dialogue needs to be paced and articulated
  in a certain way."* — the same rhythm logic applies to product-demo pacing: a beat
  grid is a pacing tool, not just a music-video gimmick.
- **`beat-sync-montage` + `music-intelligence` skills, 0xsline/OpenChatCut** (AGPL-3.0,
  1,983 ★, pushed 2026-09-21 — downloaded to `../skills/0xsline--OpenChatCut--*` for
  reference; AGPL means read for the editorial rules, do not vendor its code into a
  differently-licensed project). The single best-organized, most quotable set of editing
  rules found in this research pass:
  - **Anchors first, fill second.** Plan 3–6 moments where a cut *must* land on a
    specific musical event because the content has real impact there, then fill the
    rhythm between anchors at a density chosen per section — never uniformly.
  - **Density is an arc, not a setting.** intro/verse = sparse, build = medium
    accelerating, drop/chorus = dense (but capped at ~8 continuous seconds before it
    reads as noise, not energy), breakdown = rest, outro = sparse.
  - **Capacity check**: `shots_needed ≈ (section_seconds/60) × BPM × cuts_per_beat`. A
    140 BPM chorus at 1 cut/beat needs ~2.3 shots/second — if the footage pool can't
    supply that many usable-onset shots, lower the density or say so; don't force it.
  - **Motion continuity**: don't cut a left-moving subject into a right-moving one, don't
    alternate extreme close-up/wide repeatedly (reads as strobing), don't alternate very
    bright/very dark shots at high frequency (physically uncomfortable, watch for it).
  - **A shot needs a legible onset** (a hand entering frame, a jump launching, a door
    opening) to be cuttable on a beat at all — footage with ambiguous, driftlike motion
    doesn't improve by forcing a beat cut onto it.
- **`beat-sync-edit` skill, AkariLabs/akari-video** (MIT, 185 ★, pushed 2026-09-24 —
  downloaded to `../skills/AkariLabs--akari-video--beat-sync-edit/`). Japanese-language
  skill for a generator-driven beat-sync pipeline; its house rule worth carrying over
  even outside its own tool: **declare tempo/beat-offset by ear first and never trust an
  auto-estimate as measured ground truth** ("自動推定値を実測と偽らない" — don't pass off
  an automatic estimate as a measurement) — the same caution behind §4's sanity-check
  step below. It also treats hand-picked timecodes as a structural bug: every cut time
  should be *computed* from the declared beat grid, never typed in by feel, so a tempo
  change never desyncs only part of the edit.
- **`@remotion/media-utils`, official Remotion docs** (local copy:
  `~/.claude/skills/remotion-best-practices/remotion-markup/audio-visualization.md`).
  `useWindowedAudioData` + `visualizeAudio`/`visualizeAudioWaveform` are for **rendering**
  audio-reactive visuals (spectrum bars, waveforms, bass-driven scale/opacity) inside a
  Remotion composition in real time — a different job from `beats.ts`'s offline
  structural analysis. Use `beats.ts` to decide *when* things happen (cut points, text
  timing) and `@remotion/media-utils` to decide how a visual *reacts continuously* to the
  audio once frames are already playing (e.g. a bass-reactive logo pulse).

## 3. Algorithms (primary sources) and what `beats.ts` implements

| Stage | Method | Source |
|---|---|---|
| Onset strength envelope | STFT (32ms window / 4ms hop) → 40-band Mel → dB → first-order time difference → half-wave rectify → sum bands → 0.4Hz high-pass → ~20ms Gaussian smooth → normalize by std | Ellis, D.P.W. "Beat Tracking by Dynamic Programming." *Journal of New Music Research* 36.1 (2007): 51–60, §3.1. https://www.ee.columbia.edu/~dpwe/pubs/Ellis07-beattrack.pdf |
| Tempo estimate | Autocorrelation of the onset envelope over the 60–200 BPM lag range, weighted by a log-normal prior centered at 120 BPM (1-octave σ) as a tie-breaker, refined to sub-BPM precision by parabolic interpolation around the winning lag | Standard MIR technique; prior form matches `librosa.beat.beat_track`'s `start_bpm`/tempo-prior parameterization. https://librosa.org/doc/0.11.0/generated/librosa.beat.beat_track.html |
| Beat tracking | Dynamic programming: `C*(t) = O(t) + max_{τ=t-2p..t-p/2} { tightness·F(t-τ,p) + C*(τ) }`, `F(Δt,p) = -(log(Δt/p))²`, backtrace from the largest cumulative score | Ellis (2007) eq. (1)-(4) and the reference Matlab `beatsimple.m` listing (fig. 1) — `beats.ts`'s `trackBeats()` is a direct line-for-line port of that recurrence. `tightness` naming from `librosa.beat.beat_track`'s parameter of the same name (default 100, used here) |
| Downbeats | Score each of the 4 beat-grid phases by summed low-band (≈bottom 5 mel bands, <~500Hz) energy at its beats; the phase with the most bass energy is the downbeat | Standard "downbeat = the beat with the most low-frequency/kick energy" heuristic used across DP beat-tracker downbeat extensions; simpler than a trained downbeat model (e.g. Böck's *madmom* `DBNDownBeatTrackingProcessor`) but needs no training data or model weights, which matches "no Python, no numpy" |
| Bars / phrases | Bar = one downbeat; phrases group bars into 4/8/16-bar runs, snapped so a phrase boundary always falls on a detected structural boundary (never mid-bar) | 4/8/16-bar phrase convention is a Western pop/EDM song-form convention (not a single cited paper) — cross-checked against the `beat-density.md`/`beat-sync-montage` section-role table in §2 |
| Sections + drop(s) | Coarse (0.25s hop) 40-band Mel feature series → cosine self-similarity → Foote checkerboard-kernel novelty curve (Gaussian-tapered, ~6s window) → peak-pick boundaries (median + 1.5·MAD threshold, ≥4s apart) → snap each boundary to the nearest downbeat → label each segment by a z-scored blend of RMS energy (60%) and onset density (40%): first segment = `intro`, last = `outro`, a local score maximum above the median = `drop`, a local minimum below the median = `break`, otherwise `build` | Foote, J. "Automatic Audio Segmentation Using a Measure of Audio Novelty." *Proc. IEEE Intl. Conf. on Multimedia and Expo* (ICME 2000) — checkerboard-kernel self-similarity novelty. RMS/onset-density blend for section role labeling is this script's own heuristic, informed by the section-role table in `beat-density.md` (§2) |
| Fine onset list | Local-maxima peak-pick on the (fine, 250Hz) onset envelope with an adaptive local mean+1.2σ threshold and a 60ms minimum spacing | Standard onset peak-picking (same family as `librosa.onset.onset_detect`'s adaptive thresholding), reimplemented directly since no numpy/librosa is available |

### JS/WASM libraries considered and not used (with licence notes)

| Library | Licence | Stars | Notes |
|---|---|---|---|
| `web-audio-beat-detector` (chrisguttandin) | MIT | 680, pushed 2026-08-30 | Good, small, actively maintained tempo/beat detector — built on the Web Audio API's `OfflineAudioContext`, which Bun/Node don't provide, so it needs a browser or a Web-Audio polyfill to run headless. Worth revisiting if this ever needs to run in the Remotion Studio browser process instead of a CLI. |
| `music-tempo` (killercrush) | MIT | 138, last pushed 2020 | Pure-JS tempo/beat detector, portable to Node, but unmaintained since 2020 and only does tempo/beats — no sections or downbeats. |
| `meyda` | MIT | 1,668, pushed 2024-07 | Excellent general audio-feature-extraction library (RMS, spectral centroid, MFCC, etc.) — good building block for a *future* version of the section/novelty stage, but has no beat tracker of its own. |
| `essentia.js` | **AGPL-3.0** | — | Full-featured MIR toolkit (beat tracking, downbeats, key, danceability) compiled to WASM from the C++ `essentia` library — but AGPL-3.0 is a strong copyleft that would obligate the whole product-video pipeline (and potentially the shipped product, if this script's output were ever bundled) under AGPL terms. Not used for that reason, independent of quality. |
| `aubiojs` (qiuxiang) | MIT (JS wrapper) | 174, pushed 2023-08 | The JS/WASM *wrapper* is MIT, but it's a WASM compile of the `aubio` C library, which is **GPL-3.0-or-later**. Compiling GPL C to WASM and linking it into a JS bundle does not launder the licence — shipping this in the product still carries GPL's copyleft obligations. Same caution as `essentia.js`, one layer removed. |
| `aubio` CLI (Homebrew) | GPL-3.0-or-later | — | Checked via `brew info aubio` (2026-09-24): stable 0.4.9, not installed, pulls `libsndfile`/`numpy`/`python@3.14` as dependencies. Has `aubio beat`, `aubio tempo`, `aubio onset` subcommands that would have been a fast way to cross-check `beats.ts`'s output — but the task's own environment note is "no Python, numpy is not installed," and the CLI itself is GPL (fine to *invoke* as an external process for validation, since running a GPL binary via CLI doesn't create a derivative work the way linking/WASM-embedding does — but not installed here to keep this deliverable dependency-free and because a source-page BPM cross-check was available instead, see §4). |

**Bottom line**: `beats.ts` writes its own FFT, mel filterbank, autocorrelation, DP beat
tracker and checkerboard novelty kernel rather than depending on any of the above, so the
whole pipeline stays MIT-compatible (in fact licence-free, since it's project code) and
runs under `bun`, no Python, no GPL/AGPL exposure.

## 4. `beats.ts` — usage and validation

Location: `<skill>/scripts/beats.ts`

```bash
# Full analysis → JSON on stdout
bun beats.ts <audio-file>

# Nearest beat/downbeat to a given time (for placing a single event)
bun beats.ts <audio-file> --snap 40.2

# n cut points on downbeats that build up to the biggest drop (or --near <seconds>
# to target a specific drop/moment instead of the automatically-detected biggest one)
bun beats.ts <audio-file> --plan 5
bun beats.ts <audio-file> --plan 4 --near 90
```

Output shape:

```ts
{
  bpm: number;            // to 0.1 BPM
  beatPeriod: number;     // seconds per beat, 60/bpm
  beats: number[];        // seconds
  downbeats: number[];    // seconds, subset of beats — bar 1 of every bar
  bars: number[];         // seconds, alias of downbeats (a bar starts at its downbeat)
  phrases: { start: number; bars: number }[];
  sections: { start: number; end: number; energy: number; label: 'intro'|'build'|'drop'|'break'|'outro' }[];
  drops: number[];        // seconds, start of every section labeled 'drop'
  onsets: number[];       // seconds, fine-grained onsets (finer than the beat grid)
}
```

### Tested on the four tracks in `../audio/files/`

`beats.ts`'s tempo estimate vs. this same repo's own prior `librosa.beat.beat_track`
measurement (recorded in `../audio/LIBRARY.md`, itself flagged there as "an estimate —
verify by ear"). The `music-<n>.mp3` filenames are **Mixkit's own numeric asset IDs**
(e.g. `music-162.mp3` is `assets.mixkit.co/music/162/162.mp3`), not BPM — confirmed in
`../audio/LIBRARY.md`, so they aren't a tempo ground truth at all; the librosa figure is
the only real cross-check available offline.

| File | Track (Mixkit) | `beats.ts` BPM | Prior librosa BPM | Δ | Biggest drop(s) found |
|---|---|---|---|---|---|
| `music-124.mp3` | Techno Fest Vibes | **124.0** | 123.0 | 1.0 | 38.7s, 69.7s, 85.2s |
| `music-132.mp3` | Hazy After Hours | **121.5** | 123.0 | 1.5 | 15.4s, 45.1s, 100.7s |
| `music-162.mp3` | Minimal Techno 01 | **128.2** | 129.2 | 1.0 | 13.6s, 77.4s, 92.4s, 111.1s |
| `music-371.mp3` | Cat Walk | **129.9** | 129.2 | 0.7 | 15.0s, 66.7s, 87.1s |

All four land within 1.5 BPM of the independent prior estimate — well inside normal
onset-detector variance, and with no half/double-time confusion (the failure mode both
`LIBRARY.md` and the `beat-sync-edit` skill warn about: a detector locking onto a beat
subdivision or the bar level instead of the beat). Every track also produced a clean
intro → build → drop arc with the intro/outro always the lowest-energy segments, which
is the sanity check that matters more than the BPM digit: it means the DP tracker didn't
drift and the section labels are usable as-is for a storyboard.

Run it yourself against any other track dropped into `../audio/files/`:

```bash
cd <skill>/scripts
bun beats.ts <refs>/audio/files/<file>.mp3
```

### Known limitations

- Downbeat detection assumes 4/4 time (true for all tested tracks and for nearly all
  stock electronic/pop beds used in product promos). A 3/4 or 6/8 track would need
  `pickDownbeats()`'s `beatsPerBar` changed.
- Section labels are a heuristic (RMS + onset-density z-score blend), not a trained
  classifier — on a track with an unusual arrangement (e.g. a drop that's *quieter* than
  the build, a deliberate low-pass "phone-through-a-wall" drop), the label may read
  `break` where a human would call it `drop`. Always eyeball `sections` against the
  actual waveform before locking an edit to the labels; use `beats.ts --plan --near
  <seconds>` to target a specific moment by ear if the automatic drop pick is wrong.
- Tempo search range is 60–200 BPM; a track outside that range (very slow ballads, very
  fast hardcore/DnB) needs `BPM_MIN`/`BPM_MAX` widened in `estimateTempo()`.
