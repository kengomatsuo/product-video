# Motion: the rules the template follows

Every number here is implemented in `template/src/motion.ts`. Change the number there and
here together.

## Where the rules come from

| Tag | Source | Licence / kind |
|---|---|---|
| HF | `heygen-com/hyperframes` skills `motion-doctrine`, `cut-the-curve`, `oversized-cursor`, `seam-craft` | Apache-2.0 |
| PLM | `AbubakrChan/product-launch-motion` (ten laws, definition of done) | MIT |
| M3 | Material Design 3 easing and duration tokens, m3.material.io | spec |
| CB | IBM Carbon `packages/motion/src/dtcg/motion.json` | spec |
| FL | Microsoft Fluent 2 `packages/tokens/src/global` | spec |
| AP | Apple `Spring` docs and WWDC23 session 10158 "Animate with springs" | spec |
| AE | Adobe After Effects help: keyframe interpolation, speed | spec |
| YT | After Effects tutorials, transcripts in `~/Shared/inspo/product-video-promo/youtube/` | craft |

Full research: `~/Shared/inspo/product-video-promo/easing/README.md`.

## Continuity between beats

**Nothing appears out of nowhere, and nothing scales up to the lens and teleports.**
Cutling v3 did both and the owner rejected it (2026-09-24). One device carries the
whole film on one path (`path()` in the Cutling example): it enters from outside the
frame, and between scenes it spins while it travels to the next position, with the
recording swapped while its back faces the camera. Other devices slide in from an edge
(iPad from the left, the phone from the right, the Mac rising from below) and never
fade in on the spot.


| Rule | Value | Source |
|---|---|---|
| Default boundary | cut the curve: exit accelerates, cut lands mid-motion, entry continues the same way and decelerates | HF |
| Travel | ~12% of frame width, never fully off screen | HF |
| Exit / entry curves | power4.in / power4.out, the two halves of one power4.inOut, so speed matches at the cut | HF |
| Exit / entry time | 320 ms / 380 ms (entry at least as long as exit) | HF |
| Fade | exit opacity gone in 200 ms; entry ignites at 0.35 opacity | HF |
| Overlap | none: one side on screen per frame | HF |
| Direction | one current per film (left); another direction must be caused by something on screen | HF |
| Z moves | the sign of scale change matches across a cut: a push exit gets a push entry | HF |
| App Store previews | dissolves only, 0.33 s | Apple app-preview guidance |

## Inside a beat

| Rule | Value | Source |
|---|---|---|
| What fills a beat | staged reveals, a camera move with intent, the UI doing something, an animated sequence, a cursor-led action | HF |
| Single entry | at most 800 ms; a longer build is a stagger | HF |
| Exit | about 75% of its entry | HF |
| Total stagger | at most 500 ms | HF |
| Stillness before a payoff | 0.3 to 0.75 s (template: 450 ms before the CTA) | HF |
| Banned curves | bounce, elastic | HF |
| Overshoot | spring bounce up to 0.3; Apple warns above 0.4 feels exaggerated | AP |
| Similar elements | one curve and duration for all of them | HF |

## Pacing: how long things stay on screen

The Cutling v2 film failed here: 25 s, captions leaving before their last word landed,
camera moves of 0.3-0.5 s. The owner could not read it or see the easing. Measured from
15 real promo films (`inspo/product-video-promo/pacing/README.md`, frame-timed with OCR)
and practitioner guides (`timing/README.md`, 20 sources):

| Element | Value | Source |
|---|---|---|
| Caption on screen | max(1.6 s, characters / 8); real promo captions read at a median 7.25 chars/s | pacing (7 captions OCR-timed) |
| Hold after the last word lands | at least 1.5 s before any exit starts | BBC 0.3 s/word floor, "read it twice" rule |
| Word onsets | at speaking pace: each word starts after the previous one's syllables at 6.19 syllables/s (`speechOnsets`, `syllable` package, MIT); +0.2 s after punctuation. The owner: the entry must not be slowed, only paced like talk | Pellegrino, Coupé & Marsico 2011, English rate |
| Word rise | 0.27 s each, eased cubic out | Cutling v4 |
| Caption exit | 0.3 s dissolve, always faster than the entry | NN/g asymmetric entry/exit |
| Gap between captions | 0.3-0.5 s | Netflix 2-frame minimum, widened for promo |
| Camera move | 1.2-2 s, eased cubic; a settle of 0.6-1.2 s | pacing (measured), Blender/C4D tutorials |
| Hold between moves | 1 s or more of near-stillness (a slow drift, never a dead stop) | Williams moving hold, Murch |
| Uncut app footage | at least one 6-19 s stretch per film | pacing (every screen-recording promo measured) |
| Scene per feature | 5-10 s in an App Store preview, 8-15 s in a promo | Apple specs, agency pacing |
| Transition | 0.8-1 s for a camera move across the seam; a hard cut when the action has finished | Murch, trailer editing |
| End card | 1.5 s minimum, ~4 s with the call to action | "read it twice" rule |
| Cuts | 16-24 per 30 s at most; slower for a calm product | pacing |

Length follows the content: a 43 s film with six scenes read well where 25 s with seven
did not. Record takes at a person's pace, and cut the tool's dead waits with segments.

## Text

| Rule | Value | Source |
|---|---|---|
| Entry | waterfall: words rise from below, each starts before the previous settles | HF |
| Opacity | a short fade (60% of the rise) at a calm pace; binary only when words snap on beats | HF, Cutling v3 |
| Per-word lift and time | anchor 70 px / 180 ms, normal 45 px / 145 ms, light words 36 px / 115 ms (at ~90 px type) | HF |
| Gap | starts at 50 ms, shrinks x0.84 per word | HF |
| Curve | power4.out | HF |
| Subline | arrives after the headline settles | YT |
| Reading time | see Pacing: promo captions read at ~7 chars/s, a third of the subtitle ceiling | pacing |
| Headline length | 2 to 5 words, median 3, in the trusted store copy | `copy/README.md` |

## Camera

**A scene that shows UI frames the screen at 1.6-2x the frame height, cropped, with the
next tap's row at frame centre.** A whole phone in a 1080p frame puts UI text at ~1% of
the frame and nobody can read it; the owner rejected v6 for it (2026-09-24). The Things
and Linear phone shots (`inspo/.../launch-videos/things-84-*`, `linear-47-*`) put body
text at 4-5% of the frame. The Cutling example pans with `pan(tap, pose)` 70 frames
before each tap and pulls back mid-spin with `arc` so the turn still reads. Whole
devices are for the line-up only.

A shadow plane never rotates with its device: a turning plane shows edge-on as a grey
strip (v6 at 0:15). `LibraryDevice` keeps it in an unrotated parent.


| Rule | Value | Source |
|---|---|---|
| Push | one slow-fast-slow move onto the subject, then hold | HF (nudge curve) |
| Nudge curve | 10% of distance in the first 20% of time (power3.in), 65% linear in 18%, 25% in 62% (power4.out) | HF |
| Rotation and scale | on different elements, or the move judders | PLM law 4 |
| Motion blur | shutter 180 degrees, 8 samples, on final renders | AE convention, YT |
| Frame rate | 60 fps for social and site cuts; App Store caps at 30 | YT, Apple |

## Cursor (Mac and web)

| Rule | Value | Source |
|---|---|---|
| Size | about 7% of frame width; a life-size pointer disappears | HF, PLM law 5 |
| Entry | from below the frame, one decelerating glide, power3.out, 0.4 to 0.9 s | HF |
| Click | compress to 0.84 in 0.1 s (power2.in), release in 0.22 s (power2.out) | HF |
| Pivot | the arrow tip | HF |
| Click causes the next beat on the same frame | always | HF |
| Exit | off the nearest edge, power2.in, never a fade in place | HF |

On iOS the same press timing drives a touch dot instead of a cursor.

## Durations and curves when nothing above covers it

| Token | ms | Source |
|---|---|---|
| instant | 70 | CB fast.01 |
| fast | 150 | CB moderate.01, FL durationFast |
| base | 200 | M3 short4, FL durationNormal |
| moderate | 300 | M3 medium2, FL durationSlow |
| slow | 400 | CB slow.01 |
| emphasis | 500 | M3 long2 |
| hero | 700 | CB slow.02 |

| Curve | cubic-bezier | Source |
|---|---|---|
| standard | 0.2, 0, 0, 1 | M3 |
| enter | 0.05, 0.7, 0.1, 1 | M3 emphasized decelerate |
| exit | 0.3, 0, 0.8, 0.15 | M3 emphasized accelerate |
| easyEase | 0.33, 0, 0.67, 1 | FL curveEasyEase; AE Easy Ease is speed 0 with 33.33% influence |
| camera | 0.65, 0, 0.35, 1 | ease-in-out convention, no single spec |

| Spring | Remotion config | Source |
|---|---|---|
| smooth | mass 1, stiffness 120, damping 200 | no overshoot |
| pop | mass 1, stiffness 157.9, damping 17.6 | AP: Spring(duration 0.5, bounce 0.3) |
| heavy | mass 1.4, stiffness 90, damping 30 | big surfaces react slower (HF) |

Remotion's bare `spring()` default (mass 1, stiffness 100, damping 10) equals Apple's
default spring, which Apple's own conversion puts at bounce 0.5. Never use it bare.
