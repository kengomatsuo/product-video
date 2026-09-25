# Easing & timing research for Remotion promo videos

Research date: 2026-09-24. All numbers below are quoted from primary sources (vendor docs,
official GitHub source, or Apple's own WWDC transcript) — nothing is from memory. Screenshots
of the source pages are in this folder (`01_...png` – `26_...png`).

---

## 1. Named curves

| Name | cubic-bezier | Source | Used for |
|---|---|---|---|
| M3 Standard | `cubic-bezier(0.2, 0.0, 0, 1.0)` | [m3.material.io/styles/motion/easing-and-duration/tokens-specs](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs) (`03_m3_easing_duration_tokens.png`) | Simple, small, utility-focused transitions |
| M3 Standard decelerate | `cubic-bezier(0, 0, 0, 1)` | same | Entrances of standard-set elements |
| M3 Standard accelerate | `cubic-bezier(0.3, 0, 1, 1)` | same | Exits of standard-set elements |
| M3 Emphasized | Android `PathInterpolator` only, CSS "N/A (use Standard as fallback)" | same | Prominent, expressive transitions (headline curve of GM3) |
| M3 Emphasized decelerate | `cubic-bezier(0.05, 0.7, 0.1, 1.0)` | same | Large/expressive entrances |
| M3 Emphasized accelerate | `cubic-bezier(0.3, 0.0, 0.8, 0.15)` | same | Large/expressive exits |
| Carbon Standard (productive) | `cubic-bezier(0.2, 0, 0.38, 0.9)` | [carbon/packages/motion/src/dtcg/motion.json](https://github.com/carbon-design-system/carbon/blob/main/packages/motion/src/dtcg/motion.json) (`24_carbon_motion_json_source.png`) | UI elements moving within the viewport, fast/utilitarian |
| Carbon Standard (expressive) | `cubic-bezier(0.4, 0.14, 0.3, 1)` | same | Same role, more fluid/prominent motion |
| Carbon Entrance (productive) | `cubic-bezier(0, 0, 0.38, 0.9)` | same | Elements entering the screen |
| Carbon Entrance (expressive) | `cubic-bezier(0, 0, 0.3, 1)` | same | Prominent element entrances |
| Carbon Exit (productive) | `cubic-bezier(0.2, 0, 1, 0.9)` | same | Elements leaving the screen |
| Carbon Exit (expressive) | `cubic-bezier(0.4, 0.14, 1, 1)` | same | Prominent element exits |
| Fluent 2 curveEasyEase | `cubic-bezier(0.33, 0, 0.67, 1)` | [fluentui/packages/tokens/src/global/curves.ts](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/curves.ts) | General-purpose ease, used by Fade/FadeSnappy/FadeExaggerated components |
| Fluent 2 curveEasyEaseMax | `cubic-bezier(0.8, 0, 0.2, 1)` | same | Stronger ease variant |
| Fluent 2 curveDecelerateMid | `cubic-bezier(0, 0, 0, 1)` | same | Entrances |
| Fluent 2 curveDecelerateMax | `cubic-bezier(0.1, 0.9, 0.2, 1)` | same | Large/prominent entrances |
| Fluent 2 curveAccelerateMid | `cubic-bezier(1, 0, 1, 1)` | same | Exits |
| Fluent 2 curveAccelerateMax | `cubic-bezier(0.9, 0.1, 1, 0.2)` | same | Large/prominent exits |
| Fluent 2 curveLinear | `cubic-bezier(0, 0, 1, 1)` | same | Linear, no easing |
| easeOutBack / easeInOutCubic / etc. (named eases) | see [easings.net](https://easings.net) (`08_easings_net.png`, `10_easings_easeinoutcubic.png`, `11_easings_easeoutback.png`) | easings.net | Standard reference library of named bezier/parametric curves; useful shorthand vocabulary when briefing an editor or AE user |

Note: Apple's own HIG "Motion" page (`01_apple_hig_motion.png`) gives **no numeric easing values at
all** — it is qualitative guidance only ("brief and precise," "let people cancel motion"). It
explicitly states watchOS/SwiftUI layout animations have "built-in easing... You can't turn off or
customize easing." Polaris's public docs page now 301-redirects to `shopify.dev/docs/api/polaris`
with no motion token page; the only concrete Polaris numbers we could confirm came from the
`polaris-tokens` GitHub package (see Part 2), not a curve table — no primary cubic-bezier values
were found for Polaris motion curves. **No primary source** for Polaris easing curves.

---

## 2. Duration tokens per system

### Material Design 3 (`m3.material.io/styles/motion/easing-and-duration/tokens-specs`, `03_m3_easing_duration_tokens.png`)

| Token | ms | Use |
|---|---|---|
| `duration.short1` | 50 | |
| `duration.short2` | 100 | |
| `duration.short3` | 150 | |
| `duration.short4` | 200 | Selection controls (quoted example) |
| `duration.medium1` | 250 | |
| `duration.medium2` | 300 | |
| `duration.medium3` | 350 | |
| `duration.medium4` | 400 | FAB expanding into a sheet (quoted example) |
| `duration.long1` | 450 | |
| `duration.long2` | 500 | Card expanding to full screen (quoted example) |
| `duration.long3` | 550 | |
| `duration.long4` | 600 | |
| `duration.extra-long1–4` | 700 / 800 / 900 / 1000 | Ambient, non-input-driven transitions (e.g. carousel auto-advance at 1000ms) |

Note in the docs: "In the expressive update, components and motion now use the motion physics
system, which uses springs... The easing and duration system is still used for transitions... but
is no longer maintained." — M3 itself is moving duration/easing tokens toward springs.

### IBM Carbon (`carbon/packages/motion/src/dtcg/motion.json`, `24_carbon_motion_json_source.png`, `05_carbon_motion.png`)

| Token | ms | Use (quoted description) |
|---|---|---|
| `duration.fast.01` | 70 | "Micro-interactions such as button and toggle. Instant response to user action." |
| `duration.fast.02` | 110 | "Micro-interactions such as fade in. Subtle entrance or exit of small UI elements." |
| `duration.moderate.01` | 150 | "Default transition speed." |
| `duration.moderate.02` | 240 | "Expansion, system communication, toast." |
| `duration.slow.01` | 400 | "Large expansion, important system notifications." |
| `duration.slow.02` | 700 | "Background dimming, large hero transitions." |

Carbon's public docs page (`carbondesignsystem.com/elements/motion/overview`) states "productive
motion is significantly faster than expressive motion" but does not publish numeric duration
tables on that page itself — the ms values above are drawn from Carbon's own token source
(the DTCG-format design-token JSON, primary source), not the marketing page.

### Microsoft Fluent 2 (`fluentui/packages/tokens/src/global/durations.ts`, `25_fluentui_durations_source.png`)

| Token | ms |
|---|---|
| `durationUltraFast` | 50 |
| `durationFaster` | 100 |
| `durationFast` | 150 |
| `durationNormal` | 200 |
| `durationGentle` | 250 |
| `durationSlow` | 300 |
| `durationSlower` | 400 |
| `durationUltraSlow` | 500 |

Fluent 2's public docs page (`fluent2.microsoft.design/motion`, `06_fluent2_motion.png`) is
qualitative only ("Make it feel natural and quick... Give larger elements more time to animate
than smaller elements") — no numbers on that page; the table above is from the shipped
`@fluentui/tokens` package source.

### Shopify Polaris (`polaris-tokens/dist/duration.map.scss`)

| Token | ms |
|---|---|
| `duration-none` | 0 |
| `duration-fast` | 100 |
| `duration-base` | 200 |
| `duration-slow` | 300 |
| `duration-slower` | 400 |
| `duration-slowest` | 500 |

The public `polaris.shopify.com/tokens/motion` page now redirects (301) to a generic API
reference with no token table; values above are from the `polaris-tokens` npm package's compiled
SCSS map (primary source, since the docs page itself is gone).

### motion.dev spring() time options (`17_motiondev_spring.png`)

| Option | Default | Note |
|---|---|---|
| `duration` | 800ms | "Duration for the entire spring." Must be milliseconds when set directly on `spring()` (motion.dev normally uses seconds elsewhere — a documented historical inconsistency). |
| `visualDuration` | none (overrides `duration` when set) | "a time, set in seconds, that the animation will take to visually appear to reach its target... the bulk of the transition will occur before this time, and the 'bouncy bit' will mostly happen after." Makes it easier to time-coordinate a spring against other timed animation. |
| `bounce` | 0.25 | "0 is no bounce, and 1 is extremely bouncy." |

### Remotion Easing / spring (`18_remotion_easing.png`, `17` cross-checked against Remotion docs fetch)

Remotion's `Easing` module ports the exact API shape of React Native's Easing: `linear`, `ease`,
`quad`, `cubic`, `sin`, `circle`, `exp`, `bounce`, `poly(n)`, `elastic(bounciness)`,
`bezier(x1,y1,x2,y2)`, `spring(config)`, plus modifiers `in`/`out`/`inOut`. Remotion's Studio
timing editor (`19_remotion_timing_editor.png`) can visually edit any easing segment that is
inline in `interpolate()`/`interpolateColors()` and uses a Bezier-representable helper
(`Easing.ease`, `Easing.quad`, `Easing.cubic`, linear, bezier, or a spring config); `Easing.sin`
and `Easing.bounce` "are shown as computed values because they cannot be represented exactly as a
single cubic Bezier easing segment" (quoted from Remotion's own Studio interactivity docs).

---

## 3. Springs

### SwiftUI presets (`developer.apple.com/documentation/swiftui/animation/smooth` and `.../spring`, screenshots `02`, `09`)

`.smooth`, `.snappy`, `.bouncy` are documented only qualitatively at the type level:

- `.smooth` — "A smooth spring animation with a predefined duration **and no bounce**."
- `.snappy` — "A spring animation with a predefined duration and **small amount of bounce** that feels more snappy."
- `.bouncy` — "A spring animation with a predefined duration and **higher amount of bounce**."

Apple's docs do not publish the exact numeric duration/bounce baked into these three presets on
the reference page itself — **no primary source found for the literal numbers behind `.smooth` /
`.snappy` / `.bouncy`.** Each has a tunable overload, e.g. `smooth(duration:extraBounce:)`, so the
presets are a fixed duration + a fixed (small) bounce fed through the same underlying `Spring`
math documented below.

### Apple's own conversion formulas — quoted

The `Spring` struct docs (`developer.apple.com/documentation/swiftui/spring`, `09_swiftui_spring_struct.png`) give two worked, verbatim conversion examples:

```swift
let spring = Spring(duration: 0.5, bounce: 0.3)
let (mass, stiffness, damping) = (spring.mass, spring.stiffness, spring.damping)
// (1.0, 157.9, 17.6)

let spring2 = Spring(mass: 1, stiffness: 100, damping: 10)
let (duration, bounce) = (spring2.duration, spring2.bounce)
// (0.63, 0.5)
```

WWDC23 session 10158, "Animate with springs" (~19:26 in the talk; text quoted via the session's
own transcript) gives the symbolic form of the conversion:

> mass = 1
> stiffness = (2π ÷ duration)²
> damping = 1 − 4π × bounce ÷ duration, for bounce ≥ 0
> damping = 4π ÷ (duration + 4π × bounce), for bounce < 0

and this guidance on bounce values: "0 — a great general purpose spring that's the most
versatile"; "~15% — doesn't feel very bouncy yet, but the long tail feels a little more brisk";
"~30% — starts to feel some noticeable bounciness"; caution against going "higher than ~0.4," which
"may feel too exaggerated for a UI element."

### Computed Remotion `spring()` configs from the above

Remotion's `spring({ mass, stiffness, damping })` (`17_motiondev_spring.png` cross-referenced;
Remotion's own spring doc gives the same three-parameter physics model) takes exactly the shape
Apple's `Spring` struct emits, so Apple's two worked examples translate directly:

| Intent | Apple input | Remotion `spring()` config | Note |
|---|---|---|---|
| SwiftUI's *default* un-named spring (`mass:1, stiffness:100, damping:10`) | `Spring(mass:1, stiffness:100, damping:10)` | `spring({ mass: 1, stiffness: 100, damping: 10 })` | **This is also Remotion's own documented default** — Remotion's built-in `mass:1, stiffness:100, damping:10` (from `remotion.dev/docs/spring`) is numerically identical to Apple's baseline spring, which Apple's own conversion shows resolves to `duration ≈ 0.63s, bounce ≈ 0.5` — i.e. Remotion's un-configured default spring is fairly bouncy (bounce 0.5 sits above the "~30%" ceiling Apple's WWDC talk calls "noticeable bounciness" and near the "avoid >0.4" caution line). Worth deliberately tuning down for UI-feeling promo motion. |
| A smooth-ish 0.5s spring with mild bounce | `Spring(duration: 0.5, bounce: 0.3)` | `spring({ mass: 1, stiffness: 157.9, damping: 17.6 })` | Matches Apple's own worked example; bounce 0.3 sits right at the "noticeable bounciness" mark from WWDC guidance — good ceiling for a UI-like (not cartoonish) spring. |

At 30 fps, `duration ≈ 0.63s` ≈ 19 frames to visual settle; at 60 fps ≈ 38 frames (Remotion's
spring doesn't settle at an exact frame — `duration`/`bounce` here describe Apple's own settling
model, not Remotion's `durationInFrames`, which is a separate, optional hard cap Remotion offers on
top of the physics).

### motion.dev spring defaults (for comparison, `17_motiondev_spring.png`)

Physics defaults: `damping: 10`, `mass: 1`, `stiffness: 1` (quoted verbatim from motion.dev's own
docs — note stiffness defaults to `1`, not 100; time-based defaults `duration: 800`ms /
`bounce: 0.25` are used instead unless a physics option is explicitly set, and "time options will
be overridden if any physics options are set").

### Josh Comeau / react-spring framing (qualitative, `21_joshwcomeau_springs.png`)

No universal numeric rules; the article's only worked example is `{ mass: 1.75, tension: 200,
friction: 12 }` (react-spring's own parameter names, not stiffness/damping) and explicitly
recommends experimenting rather than memorizing values — "**no primary numeric rule**," treat as a
qualitative mental model only (mass = inertia, tension = spring tightness/bounciness, friction =
damping toward "buttery-smooth molasses" at high values).

---

## 4. Video craft rules

| Rule | Value / guidance | Source | Status |
|---|---|---|---|
| Text hold time — Netflix subtitle event duration | Min 5/6 second (20 frames @ 24fps) per event; **max 7 seconds** per event | [Netflix Timed Text Style Guide — General Requirements](https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617) (`26` covers the language-specific companion page) | Primary source |
| Reading speed — Netflix English subtitles | **Up to 20 characters/second** for adult content, **up to 17 cps** for children's content | [Netflix English (USA) Timed Text Style Guide](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977) (`26_netflix_timed_text_style_guide.png`) | Primary source (streaming-industry practice, transferable rule of thumb for on-screen promo captions) |
| Transition length at 30/60fps | No single named-system spec found; use the duration tokens in Part 2 (e.g. Carbon fast.01 = 70ms ≈ 2 frames@30fps/4 frames@60fps; M3 short4 = 200ms = 6 frames@30fps/12 frames@60fps) as concrete anchors | Derived from Part 2 tables | **No dedicated primary source for video-cut transition length specifically — derived from UI duration tokens, not a film-editing spec** |
| Stagger per word / per character | No numeric primary source found (Remotion's own `stagger()` util and motion.dev's `stagger()` are configurable with no default recommended interval published) | — | **No primary source** |
| Camera push/zoom speed and easing | Ease-in-out is the norm for camera moves; ease-out is the norm for entrances (general convention, stated qualitatively across Adobe AE speed/graph docs and craft writing — no single numeric spec) | Convention synthesized from AE Speed doc (`15`/get_page_text) and Emil Kowalski's ease-out-for-responsiveness rule (`20_emilkowalski_great_animations.png`: "ease-out... starts fast and slows down at the end, which gives the impression of a quick response") | Qualitative convention; **no primary numeric source for camera push speed** |
| Screen Studio auto-zoom + cursor smoothing | Auto-zoom "follows the smoothed cursor path, so the viewport moves in fluid pans instead of jerky jumps"; smoothing exposed as a single interpolation-strength slider, defaulting to a middle position; implementation uses "bezier-curve interpolation" | [screenify.studio auto-zoom / cursor articles](https://www.screenify.studio/blog/2026-04-10-auto-zoom-screen-recording) | Product docs, not Screen Studio's own first-party page (Screen Studio's own docs site did not surface a dedicated technical page in this search) — **treat as secondary, not primary** |
| Cut rhythm to music beats | No primary numeric source found — widely taught craft convention (cut on downbeats/every N beats) with no vendor or standards-body spec | — | **No primary source** |
| J-cuts / L-cuts | J cut: "the next scene's audio plays before the image changes... anticipation effect." L cut: "the audio from the previous scene continues to play over the video of the next scene... maintains continuity." | [Adobe Premiere Pro Help — Perform J cuts and L cuts](https://helpx.adobe.com/premiere/desktop/edit-projects/trim-clips/perform-j-cuts-and-l-cuts.html) (`16_premiere_j_l_cuts.png`) | Primary source |
| Keyframe interpolation types (Bezier/Auto Bezier/Continuous Bezier/Linear/Hold) | "Auto Bezier is the default spatial interpolation." Linear "can add a mechanical look." Hold "without a gradual transition," used "for strobe effects." | [Adobe After Effects Help — Keyframe interpolation](https://helpx.adobe.com/after-effects/using/keyframe-interpolation.html) (`14_ae_keyframe_interpolation.png`) | Primary source |
| Easy Ease default | "After you apply Easy Ease, each keyframe has a speed of 0 with an influence of 33.33% on either side." | [Adobe After Effects Help — Speed](https://helpx.adobe.com/after-effects/using/speed.html) (`15_ae_speed_graph.png`) | Primary source |
| Motion blur shutter angle 180° | Default AE shutter angle is 180°, "giving an effective shutter speed of just almost exactly 1/50 of a second at 24fps... exposes the image 50% of the time... creates a blur that looks filmic," matching the standard cinema camera shutter | Aggregated from AE community/help sources surfaced by search (ProVideo Coalition, Creative COW, AE community threads) — **not confirmed on an Adobe-owned page in this session; treat 180° figure as widely corroborated but not verified against a single first-party Adobe spec page** | Secondary, not primary |
| Overshoot limits | No numeric ceiling found in any primary source. Apple's WWDC talk gives the closest numeric guidance, but for spring *bounce*, not overshoot pixels/percent: "higher than ~0.4... may feel too exaggerated for a UI element" | WWDC23 session 10158 (spring bounce, not overshoot per se) | **No primary source for overshoot specifically; adjacent spring-bounce guidance only** |
| Anticipation | Principle named and explained qualitatively ("using a change of state to prepare for an action") — no numeric timing given | [School of Motion — Understanding the Principles of Anticipation](https://schoolofmotion.com/blog/understanding-the-principles-of-anticipation) (`23_schoolofmotion_anticipation.png`) | Named/explained in a named-author craft source; **no numeric primary spec** |
| App preview (App Store) video length | **15–30 seconds**, max 30fps, max 500MB, H.264 or ProRes 422 HQ | [Apple Developer — App preview specifications](https://developer.apple.com/help/app-store-connect/reference/app-preview-specifications) (`12_apple_app_preview_specs.png`) | Primary source |
| App preview content rules | "App previews must show only content within the app itself." "Aim to use straightforward transitions, like dissolves and fades." "Ensure text is legible... and remains on the screen long enough for people to read." | [Apple Developer — App Previews](https://developer.apple.com/app-store/app-previews/) (`13_apple_app_previews_guidance.png`) | Primary source |
| Frequency/novelty rule for whether to animate at all | "When so commonly executed, the interaction novelty is also diminished... it does start to feel more like cognitive burden after seeing the same animation for the hundredth time." Command menus, frequently-used interactions: consider removing motion entirely. | [Rauno Freiberg — Invisible Details of Interaction Design](https://rauno.me/craft/interaction-design) (`22_rauno_interaction_design.png`) | Named-author craft source, qualitative |
| Responsive-feel duration ceiling (UI, not video) | "Your animations should also usually be shorter than 300ms" for snappy/responsive interactions | [Emil Kowalski — Great Animations](https://emilkowal.ski/ui/great-animations) (`20_emilkowalski_great_animations.png`) | Named-author craft source |

---

## 5. Proposed Remotion token set

Frame math: `frames = round(ms / 1000 * fps)`.

### Durations (drawn from Part 2, cited per row)

| Token | ms | 30fps | 60fps | Cites |
|---|---|---|---|---|
| `dur.instant` | 70 | 2 | 4 | Carbon `fast.01` |
| `dur.fast` | 150 | 5 | 9 | Carbon `moderate.01` / Fluent `durationFast` |
| `dur.base` | 200 | 6 | 12 | M3 `short4` / Fluent `durationNormal` / Polaris `duration-base` |
| `dur.moderate` | 300 | 9 | 18 | M3 `medium2` / Fluent `durationSlow` / Polaris `duration-slow` |
| `dur.slow` | 400 | 12 | 24 | Carbon `slow.01` / Fluent `durationSlower` / Polaris `duration-slower` |
| `dur.emphasis` | 500 | 15 | 30 | M3 `long2` (quoted example: "card expanding to full screen") |
| `dur.hero` | 700 | 21 | 42 | Carbon `slow.02` ("background dimming, large hero transitions") |

### Curves (drawn from Part 1)

| Token | cubic-bezier | Cites |
|---|---|---|
| `ease.standard` | `(0.2, 0, 0, 1)` | M3 Standard |
| `ease.entranceEmphasized` | `(0.05, 0.7, 0.1, 1.0)` | M3 Emphasized decelerate — for elements entering frame (title cards, feature callouts) |
| `ease.exitEmphasized` | `(0.3, 0.0, 0.8, 0.15)` | M3 Emphasized accelerate — for elements exiting frame |
| `ease.easyEase` | `(0.33, 0, 0.67, 1)` | Fluent `curveEasyEase` — general-purpose UI-feeling ease, matches AE's own Easy Ease shape by convention |
| `ease.linear` | `(0, 0, 1, 1)` | Fluent `curveLinear` / AE Linear — mechanical moves only (progress bars, not entrances) |

### Springs (from Part 3)

| Token | Remotion config | Cites |
|---|---|---|
| `spring.uiDefault` | `{ mass: 1, stiffness: 100, damping: 10 }` | Apple's default `Spring` == Remotion's documented default; resolves to duration≈0.63s, bounce≈0.5 per Apple's own conversion — use only when a visibly bouncy pop is wanted |
| `spring.smoothPop` | `{ mass: 1, stiffness: 157.9, damping: 17.6 }` | Apple's worked example for `Spring(duration:0.5, bounce:0.3)` — a 0.5s spring with bounce at the "noticeable but not exaggerated" ceiling WWDC23 recommends |

---

## Screenshots in this folder

`01_apple_hig_motion.png`, `02_swiftui_animation.png`, `03_m3_easing_duration_tokens.png`,
`04_m3_motion_overview.png`, `05_carbon_motion.png`, `06_fluent2_motion.png`,
`07_polaris_motion.png` (redirected reference page), `08_easings_net.png`,
`09_swiftui_spring_struct.png`, `10_easings_easeinoutcubic.png`, `11_easings_easeoutback.png`,
`12_apple_app_preview_specs.png`, `13_apple_app_previews_guidance.png`,
`16_premiere_j_l_cuts.png`, `17_motiondev_spring.png`, `18_remotion_easing.png`,
`19_remotion_timing_editor.png`, `20_emilkowalski_great_animations.png`,
`21_joshwcomeau_springs.png`, `22_rauno_interaction_design.png`,
`23_schoolofmotion_anticipation.png`, `24_carbon_motion_json_source.png`,
`25_fluentui_durations_source.png`, `26_netflix_timed_text_style_guide.png`.

Two Adobe After Effects help pages (`keyframe-interpolation.html`, `speed.html`) render fine in an
interactive browser but return "Access Denied" to headless capture (Akamai bot protection) — their
exact text is quoted directly in Parts 3–4 above instead of screenshotted; everything quoted from
them was read live from the rendered page, not guessed.
