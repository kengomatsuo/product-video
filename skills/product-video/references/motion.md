# Motion: the rules the template follows

## Contents

- Continuity between beats
- Inside a beat
- Pacing: how long things stay on screen
- Text
- Camera
- Cursor and touch (Mac, web and iOS)
- Durations and curves when nothing above covers it

These are film numbers. For motion inside the app being filmed (a toast, a sheet, a button press) the app's own code and the house `ui-patterns` skill (`buttons-and-motion.md`) set the timing; never retime real UI to fit the edit.

Every number in the tables is implemented in `template/src/motion.ts`. Change the number there and
here together. The sources of the numbers are in `research/motion-sources.md`.

## Continuity between beats

**Nothing appears out of nowhere, and nothing scales up to the lens and teleports.**
One device carries the whole film on one path (`path()` in the worked example): it enters
from outside the frame, and between scenes it spins while it travels to the next
position, with the recording swapped while its back faces the camera. Other devices slide
in from an edge (iPad from the left, the phone from the right, the Mac rising from below)
and never fade in on the spot.

| Rule | Value |
|---|---|
| Default boundary | cut the curve: exit accelerates, cut lands mid-motion, entry continues the same way and decelerates |
| Travel | ~12% of frame width, never fully off screen |
| Exit / entry curves | power4.in / power4.out, the two halves of one power4.inOut, so speed matches at the cut |
| Exit / entry time | 320 ms / 380 ms (entry at least as long as exit) |
| Fade | exit opacity gone in 200 ms; entry ignites at 0.35 opacity |
| Overlap | none: one side on screen per frame |
| Direction | one current per film (left); another direction must be caused by something on screen |
| Z moves | the sign of scale change matches across a cut: a push exit gets a push entry |
| App Store previews | dissolves only, 0.33 s |

## Inside a beat

| Rule | Value |
|---|---|
| What fills a beat | staged reveals, a camera move with intent, the UI doing something, an animated sequence, a cursor-led action |
| Single entry | at most 800 ms; a longer build is a stagger |
| Exit | about 75% of its entry |
| Total stagger | at most 500 ms |
| Stillness before a payoff | 0.3 to 0.75 s (template: 450 ms before the CTA) |
| Banned curves | bounce, elastic |
| Overshoot | spring bounce up to 0.3; Apple warns above 0.4 feels exaggerated |
| Similar elements | one curve and duration for all of them |

When the moment the product promises lands (the thing restored, the job done), give it
an impact: a brief scale punch, outline, bloom or sparks starting 0.26 s after the object
arrives, so the viewer sees it arrive first.

## Pacing: how long things stay on screen

Captions that leave before their last word lands and camera moves of 0.3-0.5 s cannot be
read or followed. The values come from 15 real promo films (`research/pacing.md`, frame-timed with OCR)
and practitioner guides (`research/timing.md`, 20 sources):

| Element | Value |
|---|---|
| Caption on screen | max(1.6 s, characters / 8); real promo captions read at a median 7.25 chars/s |
| Hold after the last word lands | at least 1.5 s before any exit starts |
| Word onsets | at speaking pace: each word starts after the previous one's syllables at 6.19 syllables/s (`speechOnsets`, `syllable` package, MIT); +0.2 s after punctuation. Do not slow the entry; pace it like talk |
| Word rise | 0.27 s each, eased cubic out |
| Caption exit | 0.3 s dissolve, always faster than the entry |
| Gap between captions | 0.3-0.5 s |
| Camera move | 1.2-2 s, eased cubic; a settle of 0.6-1.2 s |
| Hold between moves | 1 s or more of near-stillness (a slow drift, never a dead stop) |
| Uncut app footage | at least one 6-19 s stretch per film |
| Scene per feature | 5-10 s in an App Store preview, 8-15 s in a promo |
| Transition | 0.8-1 s for a camera move across the seam; a hard cut when the action has finished |
| End card | 1.5 s minimum, ~4 s with the call to action |
| Cuts | 16-24 per 30 s at most; slower for a calm product |

Length follows the content: give every scene time to read; seven scenes in 25 s is too
fast. Record takes at a person's pace, and cut the tool's dead waits with segments.

## Text

| Rule | Value |
|---|---|
| Entry | waterfall: words rise from below, each starts before the previous settles |
| Opacity | a short fade (60% of the rise) at a calm pace; binary only when words snap on beats |
| Per-word lift and time | anchor 70 px / 180 ms, normal 45 px / 145 ms, light words 36 px / 115 ms (at ~90 px type) |
| Gap | starts at 50 ms, shrinks x0.84 per word |
| Curve | power4.out |
| Subline | arrives after the headline settles |
| Reading time | see Pacing: promo captions read at ~7 chars/s, a third of the subtitle ceiling |
| Caption length | a complete thought, readable in the time it holds |

## Camera

**A scene that shows UI frames the screen at 1.6-2x the frame height, cropped, with the
next tap's row at frame centre.** A whole phone in a 1080p frame puts UI text at ~1% of
the frame and nobody can read it; launch films put body text at 4-5% of the frame. The
worked example pans with `pan(tap, pose)` 70 frames before each tap and pulls back
mid-spin with `arc` so the turn still reads. Whole devices are for the line-up only.

**Every camera move has a target the viewer can name and a size they can see.** A push
toward a tap goes far enough to frame what is pressed (about 1.25x to 1.6x, centred on the
target), holds, and pulls back to show the result. A move with no target, or a scale
change under about 10%, reads as the device pulsing. Between moves, a slow drift.

**The camera moves after an action settles and before the next one starts.** Leaving
the moment typing ends reads as mechanical: hold at least 0.8 s after the
last character or the last animation, then move, and arrive 0.3 s or more before the next
tap. After a save, follow the result: pan to the new item and hold 1.5 s or more.

A shadow plane never rotates with its device: a turning plane shows edge-on as a grey
strip. `LibraryDevice` keeps it in an unrotated parent.

| Rule | Value |
|---|---|
| Push | one slow-fast-slow move onto the subject, then hold |
| Nudge curve | 10% of distance in the first 20% of time (power3.in), 65% linear in 18%, 25% in 62% (power4.out) |
| Rotation and scale | on different elements, or the move judders |
| Motion blur | shutter 180 degrees, 8 samples, on final renders |
| Frame rate | 60 fps for social and site cuts; App Store caps at 30 |

## Cursor and touch (Mac, web and iOS)

| Rule | Value |
|---|---|
| Size | about 7% of frame width; a life-size pointer disappears |
| Entry | from below the frame, one decelerating glide, power3.out, 0.4 to 0.9 s |
| Click | compress to 0.84 in 0.1 s (power2.in), release in 0.22 s (power2.out) |
| Pivot | the arrow tip |
| Click causes the next beat on the same frame | always |
| Exit | off the nearest edge, power2.in, never a fade in place |

On iOS the same press timing drives a touch dot instead of a cursor.

A press the viewer has to follow gets room: the finger or cursor rests on the target at
least 0.18 s before it presses, and two presses in a row sit at least 1 s apart. Check
this on the real take, since a screen recording plays at the app's speed.

## Durations and curves when nothing above covers it

| Token | ms |
|---|---|
| instant | 70 |
| fast | 150 |
| base | 200 |
| moderate | 300 |
| slow | 400 |
| emphasis | 500 |
| hero | 700 |

| Curve | cubic-bezier |
|---|---|
| standard | 0.2, 0, 0, 1 |
| enter | 0.05, 0.7, 0.1, 1 |
| exit | 0.3, 0, 0.8, 0.15 |
| easyEase | 0.33, 0, 0.67, 1 |
| camera | 0.65, 0, 0.35, 1 |

| Spring | Remotion config |
|---|---|
| smooth | mass 1, stiffness 120, damping 200 (no overshoot) |
| pop | mass 1, stiffness 157.9, damping 17.6 |
| heavy | mass 1.4, stiffness 90, damping 30 (big surfaces react slower) |

Remotion's bare `spring()` default (mass 1, stiffness 100, damping 10) equals Apple's
default spring, which Apple's own conversion puts at bounce 0.5. Never use it bare.
