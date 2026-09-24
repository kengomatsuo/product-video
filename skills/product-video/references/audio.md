# Sound and cutting to music

Pick the track before the storyboard. The film's timeline is built on the track's bars;
a storyboard written first gets cut against the music and never lands.

## 1. Pick and measure the track

The owner's verdicts on 2026-09-24, from three reels of 49 stock tracks:

| Kind | Verdict | Examples |
|---|---|---|
| Minimal techno, tech house | rejected: the kick and bass read as clanky on a phone speaker | Mixkit "Hazy After Hours" |
| Cheerful stock pop, ukulele, "happy corporate", upbeat drops in the style of NCS (the free EDM label) | rejected as DIY | Mixkit "Smile", "Pop 05" |
| Solo or felt piano | wrong for promos; fits a tutorial | Pixabay "Minimal Piano", "Soft Felt Piano" |
| Warm pads with a lift, no hard drop | chosen | Pixabay "Revival" (Diamond_Tunes) |
| A patient atmospheric build, or a confident build to a late payoff | acceptable | Pixabay "Chase the Sparks", "Confident Background" |

Start from `~/Shared/inspo/product-video-promo/music-for-promos/README.md` (what Apple,
Samsung and app launch films use, and the traits). Reject a track whose band below 90 Hz
sits within 5 dB of its full-band level: that is the bass-heavy sound the owner rejected.
The owner listens on a phone, so always send a sample reel with a spoken number before
each track, and never pick the music alone.

Library: `~/Shared/inspo/product-video-promo/audio/LIBRARY.md` (34 tracks, 119 effects,
each with its licence and the exact attribution line when one is required).

```bash
bun <skill>/scripts/beats.ts <track.mp3> > beats.json          # bpm, beats, downbeats, bars, sections, drops
bun <skill>/scripts/beats.ts <track.mp3> --snap 9.9            # nearest beat / downbeat
bun <skill>/scripts/beats.ts <track.mp3> --plan 6 --near 10    # 6 cuts on downbeats, biggest drop near 10 s
```

`beats.ts` decodes with ffmpeg, builds a mel onset envelope, estimates tempo by
autocorrelation with sub-lag precision, tracks beats by dynamic programming (Ellis 2007),
picks downbeats by bass energy, and finds sections and drops with a checkerboard
novelty kernel (Foote 2000). On the four Mixkit tracks it tested, every tempo came
within 1.5 BPM of an independent librosa run.

Choose a start point on a downbeat so the track's drop lands on the film's payoff.
Cutling: "Revival" from 24.10 s puts its 33.94 s lift on bar 5, the frame where the pasted
address appears, and its 65.41 s section change on "On the App Store" at bar 21.

## 2. Build the timeline on bars

```ts
const BAR = 60 / bpm * 4 * FPS;         // frames per bar
const B = (n: number) => Math.round(n * BAR);
```

| Event | Where | Lead | Source |
|---|---|---|---|
| Scene cut | a downbeat | the outgoing move peaks on it | `music-sync/README.md` |
| Payoff (the thing the video is for) | the drop | 0 | Cutling film |
| A word of a headline | a beat, one word per beat (half-beat for long lines) | 2 frames early, so the eye meets it on the beat | `music-sync/README.md` |
| Build-up card | the bars before the drop, with a riser ending on the drop | 0 | Cutling film |
| Logo | a downbeat near the end, with an impact | impact peak on the frame | Cutling film |
| Call to action | the next downbeat after a held beat of stillness | 0 | HyperFrames |

## 3. Effects

| Event | Effect (Mixkit id) | Level | Placement |
|---|---|---|---|
| Every tap | select click 1109 | 0.28 | 2 frames before the touch dot |
| Typing | keyboard typing 1386 | 0.16 | under the typed span only |
| Seam | fast whoosh 1490 / swipe 2627 | 0.32 | peak (0.70 s / 0.25 s in) on the cut |
| Into the drop | space stutter riser 1144 | 0.30 | its end on the drop |
| The payoff | pop 2357 | 0.60 | on the drop |
| Logo landing | movie impact 2902 | 0.45 | peak (1.30 s in) on the landing |

Measure an effect's peak before placing it (the scratch script in the Cutling project
prints onset and peak times). A long file is trimmed with `trimBefore`, never cut by ear.

## 4. Master

`bash tools/master.sh <Comp> <version>` renders ProRes, measures loudness, and encodes
with two-pass `loudnorm` to -14 LUFS, true peak -1.5 dBTP, then prints the loudness of
the delivered file. You cannot hear it: report those numbers.
