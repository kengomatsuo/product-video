# Research before the first scene

The approved Cutling film came out of a reference library of 570 human-made images and
clips, each with a note on what to take from it. The first cut, made without that
library, was a slideshow the owner rejected. Skip this step and the film comes out the
same way.

## 1. Read what is already known

`research/` holds the study notes from the 2026-09-24 sweep. Read the ones for the step
you are on before gathering anything new:

| File | What it answers |
|---|---|
| `launch-videos.md`, `youtube.md` | how real launch films open, move a device, and end |
| `appstore-previews.md`, `posters.md` | what App Store previews and panels put on screen, headline by headline |
| `copy.md`, `headlines.json` | how long human headlines are (median 3 words) and which words give AI copy away; 319 trusted headlines |
| `pacing.md`, `timing.md`, `timing-sources/` | shot lengths, holds, reading time, with sources |
| `easing.md` | curves and durations from Material, Carbon, Fluent, Apple |
| `music-for-promos.md`, `music-sync.md`, `audio-library.md` | what launch films use for music, cutting to the bar, licensed tracks |
| `dribbble-behance.md`, `github.md` | motion-design shots and open-source promo code; low trust for copy |

## 2. Gather, before studying anything

Two sets, both saved before any study starts. **On the topic**: the product's competitors
and its category. **General**: the best work in any category, for craft that no
competitor shows. Keep them in `<refs>` = `~/Shared/inspo/<product>-promo/` (or any
folder the owner names), one folder per kind, each with a `notes.md` table: source URL,
file, topic or general, what to take. At least 250 items across the kinds below:

| Kind | On the topic | General | How |
|---|---|---|---|
| Video: launch films, App Store previews | competitors' previews and launch films | Apple and Samsung keynote films, Linear, Things, Screen Studio | `refs-appstore.sh`, or `yt-dlp` then `refs-frames.sh` |
| Stills: posters, store panels, launch galleries | competitors' panels and sites | Product Hunt's top launches | save the image and its page URL |
| Code: open-source promo and motion code | promo repos for similar apps | Remotion showcases, HyperFrames, motion skills | clone into `<refs>/github/`, note the file that does the move |
| Guidelines | Apple app preview specs, the store's rules for the category | motion tokens (Material, Carbon, Fluent, Apple HIG), subtitle and reading-time rules | save the page as markdown with its URL and date |
| Prose: on-screen copy | competitors' headlines | trusted launch copy (tiers A and B) | `refs-copy.ts` over every image |
| Music: candidates for this film's mood | what competitors' films use | what Apple, Samsung and studio launch films use | licensed libraries only; note licence and attribution line |

`research/` already holds a general set; add to it, do not repeat it. Search the
product's category first. A gated or broken source is written down as skipped, never
guessed.

## 3. Study it

- **Look at every image.** The note says what the shot does in one line: device, angle,
  motion, how much text, which colour carries the brand.
- **Read the copy.** `bun <skill>/scripts/refs-copy.ts <refs> --tiers tiers.json` reads the
  text of every image (macOS Vision) and flags lines with an LLM tell. Assign a tier by
  source: A in-house writers (launch films of known studios), B established store
  listings (older copy is safest), C mixed (Product Hunt, 2025-26 launches), D
  placeholder (Dribbble, tutorials; never an example). Only A and B lines teach captions.
- **Time the films.** `refs-frames.sh` writes each film's cut times. Compare the shot
  lengths with `pacing.md` before choosing the film's grid.
- **Write the three directions from what you saw.** Each names the references it takes
  from, by file.

## 4. Captions come from the examples

Write each caption after reading the trusted lines for the same job (a hook, a feature,
a payoff) in `headlines.json` and this product's `copy/lines.json`. Match their length
and grammar: a verb and a concrete object, 2 to 5 words, a fact the screen proves. Then
put it through `human-prose`. A caption that would fit any product fails.

## 5. Music is picked by the owner, by ear

Make a sample reel: 15 to 20 s of each candidate, a spoken number before each, sent to
the owner's phone. The owner picks. Never a synthesized bed: on 2026-09-24 the owner
compared synthesized drums to "trash cans" in a horror film.
