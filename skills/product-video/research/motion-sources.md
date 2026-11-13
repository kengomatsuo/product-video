# Sources of the numbers in references/motion.md

| Tag | Source | Licence / kind |
|---|---|---|
| HF | `heygen-com/hyperframes` skills `motion-doctrine`, `cut-the-curve`, `oversized-cursor`, `seam-craft` | Apache-2.0 |
| PLM | `AbubakrChan/product-launch-motion` (ten laws, definition of done) | MIT |
| M3 | Material Design 3 easing and duration tokens, m3.material.io | spec |
| CB | IBM Carbon `packages/motion/src/dtcg/motion.json` | spec |
| FL | Microsoft Fluent 2 `packages/tokens/src/global` | spec |
| AP | Apple `Spring` docs and WWDC23 session 10158 "Animate with springs" | spec |
| AE | Adobe After Effects help: keyframe interpolation, speed | spec |
| YT | After Effects tutorials, transcripts in `<library>/youtube/` | craft |

Full research: `<library>/easing/README.md`, `research/easing.md`.

## Continuity between beats

All rows: HF, except App Store previews (dissolves only, 0.33 s): Apple app-preview guidance.

## Inside a beat

All rows: HF, except Overshoot: AP.

## Pacing

| Element | Source |
|---|---|
| Caption on screen | pacing (7 captions OCR-timed) |
| Hold after the last word lands | BBC 0.3 s/word floor, "read it twice" rule |
| Word onsets | Pellegrino, Coupé & Marsico 2011, English rate |
| Caption exit | NN/g asymmetric entry/exit |
| Gap between captions | Netflix 2-frame minimum, widened for promo |
| Camera move | pacing (measured), Blender/C4D tutorials |
| Hold between moves | Williams moving hold, Murch |
| Uncut app footage | pacing (every screen-recording promo measured) |
| Scene per feature | Apple specs, agency pacing |
| Transition | Murch, trailer editing |
| End card | "read it twice" rule |
| Cuts | pacing |

## Text

| Rule | Source |
|---|---|
| Entry, opacity, per-word lift and time, gap, curve | HF |
| Subline | YT |
| Reading time | pacing |
| Headline length | `copy/README.md` |

## Camera

| Rule | Source |
|---|---|
| Push, nudge curve | HF (nudge curve) |
| Rotation and scale | PLM law 4 |
| Motion blur | AE convention, YT |
| Frame rate | YT, Apple |

## Cursor and touch

All rows: HF. Size: also PLM law 5.

## Durations and curves

| Token | Source |
|---|---|
| instant | CB fast.01 |
| fast | CB moderate.01, FL durationFast |
| base | M3 short4, FL durationNormal |
| moderate | M3 medium2, FL durationSlow |
| slow | CB slow.01 |
| emphasis | M3 long2 |
| hero | CB slow.02 |

| Curve | Source |
|---|---|
| standard | M3 |
| enter | M3 emphasized decelerate |
| exit | M3 emphasized accelerate |
| easyEase | FL curveEasyEase; AE Easy Ease is speed 0 with 33.33% influence |
| camera | ease-in-out convention, no single spec |

| Spring | Source |
|---|---|
| smooth | no overshoot |
| pop | AP: Spring(duration 0.5, bounce 0.3) |
| heavy | HF |
