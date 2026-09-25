# IBM Carbon Design System — Motion

URL: https://carbondesignsystem.com/elements/motion/overview/
Tokens/code: https://v11.carbondesignsystem.com/guidelines/motion/code

Fetched: 2026-09-24 (WebSearch aggregation; Carbon's docs site is JS-rendered so direct WebFetch returned no body — values below are the widely-cited @carbon/motion token names and the "100–300 ms" range stated in secondary coverage of the same package)

## Notes

- Two named **modes**: **Productive** (fast, efficient, low-key — for micro-interactions, buttons, dropdowns, anything the user does repeatedly) and **Expressive** (slower, more visible — reserved for significant moments like opening a page or confirming a primary action).
- Six named duration tokens shared across both modes' scale: `fast-01`, `fast-02`, `moderate-01`, `moderate-02`, `slow-01`, `slow-02` — most component animations in the library land in the **100–300 ms** band, with Productive mode using the faster end and Expressive mode the slower end of the same token set.
- Duration is explicitly a function of **distance/size traveled**: Carbon's guidance and its "Motion Generator" tool calculate duration from how far or how large the moving element is, rather than using one fixed number for every transition.
- Distinct standard/entrance/exit easing curves are paired with each mode so entrances and exits don't share a curve.

## Quote (under 15 words)

"the larger the change in distance or size... the longer the animation takes"
