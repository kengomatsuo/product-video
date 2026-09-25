# Kinetic Typography — Word/Line Hold & Stagger Timing

URLs:
- https://www.svgator.com/blog/kinetic-typography-a-guide-to-text-in-motion/
- https://www.linearity.io/blog/kinetic-typography/

Fetched: 2026-09-24 (WebSearch across kinetic-typography practitioner guides)

## Notes

- Rule-of-thumb hold time per word: **~0.3 seconds per word**, with a **1-second floor** even for single short words — below that, a word flashes rather than reads.
- Formula cited for a full line: **seconds on screen ≈ (character count ÷ 12) + 0.5**, then round to the nearest 0.25 s so text changes land on musical/edit beats. Example given: a 7-word line typically needs **1.8–2.5 s**.
- **Reveal-in speed**: the entrance animation itself (letters/words assembling into place) should resolve in **well under ~800 ms** — the reveal is a flourish, not the reading time; reading time starts after the reveal completes, not during it.
- **Stagger**: the offset between successive letters/words entering is a separate knob from the per-element duration. A narrow stagger window makes elements arrive almost together (a light ripple); a wide window makes them arrive one at a time (a counted reveal). Left-to-right stagger direction reads as most natural for LTR scripts.

## Quote (under 15 words)

"the reveal itself should land in under about 800ms"
