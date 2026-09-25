# Material Design 3 — Easing and Duration Tokens

URL: https://m3.material.io/styles/motion/easing-and-duration/tokens-specs

Fetched: 2026-09-24 (WebSearch aggregation of the M3 token spec table; direct WebFetch returned a JS-only shell, so values below are cross-checked against multiple citing sources rather than a single scrape)

## Notes

Named duration tokens (ms), short → extra-long:

| Token | ms |
|---|---|
| short1 | 50 |
| short2 | 100 |
| short3 | 150 |
| short4 | 200 |
| medium1 | 250 |
| medium2 | 300 |
| medium3 | 350 |
| medium4 | 400 |
| long1 | 450 |
| long2 | 500 |
| long3 | 550 |
| long4 | 600 |
| extra-long1 | 700 |
| extra-long2 | 800 |

- Usage bands: **short** = simple/small/utility transitions (icon toggles, small state changes); **medium** = transitions traversing a medium area of the screen; **long** = large, expressive transitions, usually paired with the "Emphasized" easing curve; **extra-long** (600 ms+) reserved for rare, ambient transitions with no direct user input (i.e., not for anything the user is waiting on).
- M3 also ships an "Emphasized" easing curve (a multi-segment spring-like curve) distinct from the older linear/standard/decelerate/accelerate curves in M2, aimed at feeling more physical.

## Quote (under 15 words)

"the larger the change... the longer the animation takes" (paraphrase of token-band rule)
