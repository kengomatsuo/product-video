# Timing doctrine for motion graphics, product promo video, and UI animation

This is the written doctrine and the numbers practitioners publish — not measurements from real
promo videos (that's `../pacing/README.md`, built by measuring actual shot/caption durations).
Every claim here traces to a source note in `sources/`, fetched or searched this session
(2026-09-24). Where a source is genuinely load-bearing for a spec-table number, the note says so;
where a figure is a community rule of thumb rather than a named authority's published number,
the note flags it as lower-confidence.

## 1. Classic animation timing

- **Richard Williams, *The Animator's Survival Kit*** — timing is the frame count between two
  poses; spacing is how those in-between frames are distributed. A plain hold under ~4 frames
  (24fps, ~1/6 s) reads as a hitch, not a pose; anything held much longer needs to become a
  **moving hold** (a pose that keeps drifting slightly) so it doesn't look dead.
  → `sources/williams-animators-survival-kit.md`
- **Harold Whitaker & John Halas, *Timing for Animation*** — the field's core reference, with
  chapters literally titled "How Long to Hold?", "Getting Into and Out of Holds," and "Ones or
  Twos?" (every frame vs. every other frame at the same nominal duration).
  → `sources/halas-whitaker-timing-for-animation.md`
- **Disney's 12 Principles — Slow In/Slow Out & Timing** — more in-between frames cluster near
  the start/end of a move (easing), while the raw frame count (timing) decides whether an action
  reads as heavy or light.
  → `sources/disney-12-principles-slow-in-slow-out.md`

## 2. Motion design practitioners

- **School of Motion / Ben Marriott / Jake Bartlett** — translate the classic-animation
  principles above into After Effects terms: hold keyframes, graph-editor easing, anticipation
  and overlapping action as the two most-drilled principles. No single numeric table found from
  these sources — they teach through demonstration, not published figures.
  → `sources/motion-design-practitioners.md`
- **Kinetic typography** — hold a word ~0.3 s (1 s floor); a line ≈ (characters ÷ 12) + 0.5 s,
  rounded to the nearest 0.25 s; the reveal-in animation itself should resolve in well under
  800 ms so it doesn't eat into reading time.
  → `sources/kinetic-typography-timing.md`

## 3. Reading-time rules for on-screen text

- **Netflix Timed Text Style Guide** — 20 cps max (adult), 17 cps (children); minimum duration
  20 frames / 5/6 s; maximum 7 s; minimum 2-frame gap between subtitles (3–11 frame gaps at 24fps
  must be closed to exactly 2 frames).
  → `sources/netflix-subtitle-timing.md`
- **BBC subtitle guidelines** — 160–180 wpm (≈0.33–0.375 s/word); floor of ~0.3 s/word. Notably
  more generous (slower) than Netflix's cps ceiling — BBC is tuned for a broad broadcast
  audience, Netflix per-language and skewed faster for adult/non-children content.
  → `sources/bbc-subtitle-guidelines.md`
- **"Read it aloud twice" rule** — hold a title long enough for a 200-wpm slow reader to read it
  twice; a floor/sanity-check, not a formula to apply blindly.
  → `sources/read-aloud-twice-rule.md`
- **Social caption practice (TikTok etc.)** — 2–3 s minimum per short caption; platform-native
  tools trend toward per-word reveal rather than one static block. No official Meta/YouTube
  numeric spec found — flagged lower-confidence.
  → `sources/social-caption-duration.md`

## 4. Film/trailer editing rhythm

- **Walter Murch, *In the Blink of an Eye*** — a cut works when it lands where a blink naturally
  would; his Rule of Six weights what makes a cut work (Emotion 51%, Story 23%, Rhythm 10%,
  Eye-trace 7%, 2D plane 5%, 3D space 4%) — rhythm/timing matters but is subordinate to emotion
  and story.
  → `sources/walter-murch-blink-of-an-eye.md`
- **Cinemetrics average shot length data** — Classical Hollywood averaged 8–11 s/shot; modern
  mainstream film averages 4–6 s; extremes run from *2001*'s ~13 s to *Bourne Supremacy*'s ~2.4 s.
  → `sources/cinemetrics-average-shot-length.md`
- **Trailer/commercial editing practice** — let an action finish before cutting to a static
  shot; "decompressions" (deliberately held beats) buy the audience a breath at high-emotion
  moments, but trailers have far less room for them than a feature.
  → `sources/trailer-editing-breathing-room.md`

## 5. UI motion duration tokens and research

- **NN/g** — 100 ms for simple feedback (toggle/checkbox); 200–300 ms for substantial screen
  changes (modal); general range 100–500 ms scaled to distance/complexity; 400 ms = very slow,
  reserved for big movements; 500 ms = starts to feel like a drag. Entering elements get a
  subtly longer duration than exiting ones (e.g. 300 ms in / 200–250 ms out).
  → `sources/nngroup-animation-duration.md`
- **Material 3** — named tokens from 50 ms (short1) to 800 ms (extra-long2); short = small
  utility transitions, medium = elements crossing a medium screen area, long = large expressive
  transitions (paired with the "Emphasized" curve), extra-long = rare ambient transitions with no
  user input.
  → `sources/material3-motion-duration-tokens.md`
- **Apple HIG** — qualitative rather than tabular; developer/WWDC practice clusters at under
  ~200 ms for light in-page interactions, ~300–500 ms for full-screen transitions, and
  spring animations tuned to settle in 0.4–0.7 s. Must collapse toward none under Reduce Motion.
  → `sources/apple-hig-motion.md`
- **IBM Carbon** — Productive (fast, efficient) vs. Expressive (slower, more visible) modes over
  a shared token scale (`fast-01/02`, `moderate-01/02`, `slow-01/02`), most landing 100–300 ms;
  duration is explicitly calculated from the size/distance of the moving element.
  → `sources/carbon-design-motion.md`
- **Microsoft Fluent** — named constants: 83 ms (faster), 167 ms (fast), 250 ms (normal); same
  size/importance-scales-duration rule as Material and Carbon.
  → `sources/fluent2-motion.md`

Every one of these systems agrees on the same shape: **~100 ms is the floor for anything to
register as intentional; ~500 ms is the ceiling before "quick" becomes "slow"; and duration
should scale up with how far or how large the moving thing is**, not stay fixed across every
transition.

## 6. Camera move timing for 3D product shots

- **Blender/C4D product-animation practice** — default Bezier keyframe interpolation eases
  every camera move automatically; dedicated product-camera add-ons organize a sequence as
  discrete shots, each with its own frame-count duration and an explicit ease choice. No
  primary source gives a canonical "a push-in takes N seconds" number — this is the weakest-
  sourced area in this collection; the spec table below triangulates a duration from the App
  Store pacing data (§7) and the UI "large movement, longer duration" scaling rule (§5) rather
  than a camera-specific citation.
  → `sources/blender-camera-easing.md`

## 7. Promo/App Store preview pacing advice

- **Apple App Preview specs** — 15–30 s length, up to 3 previews per app/locale; poster frame
  defaults to the 5-second mark, so the opening seconds carry outsized weight.
  → `sources/apple-app-preview-specs.md`
- **Agency pacing practice** — homepage demos run 45–120 s (60–90 s recommended for a full
  outcome-led overview); social micro-demos run 10–30 s on one feature; shot pacing inside a
  demo averages 3–4 s/shot; even a 60 s commercial may show actual app UI for only 8–10 s total;
  the first 3 seconds are treated as the make-or-break retention window.
  → `sources/app-promo-pacing-agencies.md`

---

## Spec for product-video

Every number below cites the section/source it's drawn from. Where sources disagree, the range
is shown and the picked value is explained.

| Element | Recommended duration/hold/ease | Source(s) | Notes on disagreement |
|---|---|---|---|
| **Word/line entry** (kinetic type reveal) | Reveal animation: **≤ 800 ms**. Then hold: **~0.3 s/word, 1 s floor**, or line ≈ (chars ÷ 12) + 0.5 s, rounded to nearest 0.25 s | §2 kinetic typography | — |
| **Minimum hold after caption finishes entering** | **≥ 1.2–1.5 s** for a short (3–5 word) line before any exit begins | §3 BBC (0.3 s/word floor) + §3 "read twice" rule | BBC's per-word floor (~0.3–0.375 s/word) is more generous than Netflix's 20 cps ceiling (~0.5 s/word for common English word lengths at 20 cps); **picked BBC's slower floor** because a promo caption is read once, cold, with no rewind — Netflix's ceiling assumes a viewer who can pause |
| **Caption exit** | **≤ hold duration ÷ 4**, and always faster than the entry (e.g. 200–250 ms exit vs. 300 ms+ entry) | §5 NN/g (asymmetric entry/exit) | NN/g's rule is for UI chrome, not text, but the "exit needs to just get out of the way" logic applies directly to captions |
| **Gap between captions** | **≥ 2 frames minimum; ~0.3–0.5 s typical** for a clean beat between two consecutive lines | §3 Netflix (2-frame min, close 3–11 frame gaps) | Netflix's rule is a broadcast-legibility floor; picked the larger 0.3–0.5 s end for promo work because a promo has fewer captions competing for runway than a film's dialogue track |
| **Phone/product camera move duration** | **1.5–3 s per move** (push-in, pan, or orbit segment) | §6 Blender/C4D practice (qualitative) + §7 agency shot pacing (3–4 s/shot) | No camera-specific numeric source exists; **picked a range slightly under** the agency's general 3–4 s/shot average because a camera move usually shares its shot with other action (UI change, caption), so the pure camera-motion budget should undercut the full shot length |
| **Hold between camera moves** | **0.5–1 s** static hold before the next move starts | §1 moving-hold principle + §4 trailer "let the action finish" rule | Combines the classic-animation instruction to never move on to move (finish the current hold or move fully) with trailer editing's rule against cutting mid-motion |
| **Tap → result wait** | **100–300 ms** | §5 NN/g (100 ms simple feedback, 200–300 ms substantial change) + Apple HIG (~200 ms light interaction) | Both design-system sources converge tightly here; no real disagreement — picked the overlap |
| **Scene length per feature** | **5–10 s** in a 15–30 s App Preview; **8–15 s** in a longer (45–90 s) promo | §7 Apple App Preview specs (15–30 s ÷ 2–3 features) + agency pacing (3–4 s/shot × 2–3 shots per feature) | Apple's hard length ceiling forces the shorter end for App Store previews specifically; longer-form promos have more room, so the range widens |
| **Transition length** (cut/wipe/morph between scenes) | **200–500 ms** for a UI-style transition; a **hard cut** (0 ms) where the classic editing rule (finish the action, then cut) is honored | §5 UI duration tokens (Material long1–long2, 450–500 ms) + §4 Murch/trailer editing (cut on completed action, not mid-motion) | UI systems assume an animated transition; classic film editing prefers invisible hard cuts. **Picked both as valid depending on whether the promo is "UI-style" (animated) or "cinematic" (cut)** — don't force one convention onto the other's footage |
| **End card / logo hold** | **1.5–2 s minimum**, up to ~2.5 s if it carries a CTA to read | §3 "read twice" rule + §3 BBC per-word floor, applied to a short (2–4 word) logo/CTA line | A logo alone needs less; a logo + one-line CTA needs the full reading-twice floor |
| **Stillness before climax** (the beat right before the big reveal/CTA) | **0.5–1 s** of near-stillness (a moving hold, not a dead stop) immediately preceding the payoff beat | §1 Williams (moving hold) + §4 Murch (rhythm) + §4 trailer "decompression" | All three point the same direction: a beat needs a breath immediately before it lands, but a *dead* stop (zero motion) reads as a technical glitch rather than a deliberate pause — hence "moving hold," not full stillness |

### General scaling rule (applies to every duration above)

Every UI motion system in §5 states the same relationship independently: **duration should
scale up with the distance or size of the thing moving, and down with how important speed
feels versus deliberateness.** A small tap-target change stays near the 100 ms floor; a
full-screen transition or a large product-camera move should sit nearer the top of its range.
None of the ranges above are fixed constants — treat them as bands to scale within, the same
way Material, Carbon, and Fluent all scale their own token bands.
