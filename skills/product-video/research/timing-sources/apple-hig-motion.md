# Apple Human Interface Guidelines — Motion

URL: https://developer.apple.com/design/human-interface-guidelines/motion

Fetched: 2026-09-24 (WebSearch aggregation; direct WebFetch returned only the page shell — Apple's HIG is JS-rendered and the numeric guidance below is cross-checked across multiple pages/sources citing current HIG copy, not a single scrape)

## Notes

- Apple's own HIG text is deliberately qualitative ("purposeful," "help people stay oriented") rather than tabular like Material's tokens, but the numbers developers extract and use in practice (and Apple's own sample code / WWDC talks) cluster as:
  - Light, in-page interactions (toggles, small state changes): **under ~200 ms**.
  - Transitions between full pages/screens with many elements: **~300–500 ms**.
  - Spring-based animations (the default feel on iOS since iOS 13): typically tuned to settle in **0.4–0.7 s** with slight overshoot rather than a fixed linear duration.
- Core principle: animation must respect **Reduce Motion** — when that accessibility setting is on, cross-fade or remove motion rather than scale it down.
- Apple frames duration less as a fixed number and more as "enough time to notice and interpret the motion, no more" — i.e., duration is a floor set by legibility, not a ceiling set by taste.

## Quote (under 15 words)

"Don't add motion for the sake of adding motion."
