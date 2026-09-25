---
name: product-video
description: Make promo videos and App Store previews for your own software products, from real recordings of the app in the product's own brand. Runs a gated pipeline: gather 250+ references on the topic and in general (launch films, store previews, code, guidelines, on-screen copy, music), study them, plan and propose a storyboard, wireframe it as an animatic, then build in Remotion with a cited motion system and checks for size, frame rate, App Store rules and frame pops. Use for launch videos, social cuts, site hero loops, App Store and Mac App Store previews, and feature announcements. Not for explainer lectures.
when_to_use: "Trigger phrases: promo video, launch video, app preview, App Store preview video, product video, demo reel, feature video, video for the site, Reels, Shorts, TikTok for the app, make a video of the app."
user-invocable: true
---

# Product promo videos

The screen is always the real product, recorded moving. Everything else (frame, type,
camera, transitions) is a layer on top, in the product's own brand. Remotion API details
live in Remotion's official skill (`remotion-dev/skills`, `remotion-best-practices`);
this skill decides what to make and how it should move.

## THE PIPELINE, IN ORDER. NO PHASE IS SKIPPED

A film made without the first four phases is a slideshow; the owner rejected exactly
that on 2026-09-24. Each gate waits for the owner's approval.

| # | Phase | Output | Read |
|---|---|---|---|
| 1 | **Gather** references on the topic (competitors, category) and general ones (best launch films, code, guidelines, prose, music for the mood); 250+ items, saved with sources | `<refs>/*/notes.md` | `references/research.md` |
| 2 | **Study** them: a note per item, the copy read and tiered, the films' cut times measured | notes filled in, `copy/lines.json` | `references/research.md`, `research/` |
| 3 | **Plan** the storyboard: brief, three directions from the references, the music picked from a sample reel, the beat table in bars | `storyboard.md` | `references/storyboard.md` |
| 4 | **Propose** the storyboard to the owner. GATE | the page or file sent | `references/storyboard.md` |
| 5 | **Wireframe**: the table in `storyboard.json` with `wire:` boxes, stills and an animatic on the real music. GATE | contact sheet, animatic | `references/storyboard.md` |
| 6 | **Build**: capture the shot list, replace each box with its take, build scene by scene | the film | the sections below |
| 7 | **Check and hand over** | master, check report | `references/qa.md` |

`bun <skill>/scripts/new-project.ts <product-dir> <out-dir>` sets up the project before
phase 5: it reads the brand (`detect-brand.ts`), copies the icon, fonts, screenshots and
clips into `public/`. Its starter storyboard is a
placeholder; the phase 3 table replaces it.

Captions are written in phase 3 from the trusted examples (`research/headlines.json`,
the product's own `copy/lines.json`), 2 to 5 words, verb and object, a fact the screen
proves, through `human-prose`. See `references/copy.md`. Capture rules are in
`references/capture.md`; screenshots are only for a screen that genuinely holds still.

## The film, not the slideshow

A storyboard of stills in a frame is a slideshow. A film has: real recordings playing on
a 3D device that keeps moving across cuts; touches you can see; words arriving on beats;
seams that carry motion through (cut the curve, zoom-through, a spin); a background that
drifts; music whose drop lands on the payoff; an effect on every action; and a master
with no banding at -14 LUFS. `examples/cutling/Film.tsx` is the worked example: six
scenes on a 121.5 BPM bar grid, timed to the pacing table in `references/motion.md`. Copy it
into `src/`, register it in `src/Root.tsx`, and build the new film on its pieces (`Phone3D`,
`Background`, `Words`, the `path`/`pan`/`settle` rig) rather than on the simpler `Promo`
beats. Its timings and `rec/` takes are Cutling's: replace them all.
See `references/devices-and-backgrounds.md`.

## Build

Edit `src/storyboard.json`. A beat is one of:

| type | fields |
|---|---|
| `title` | `text`, `sub` |
| `shot` | `src` (capture), `device` (`iphone`, `ipad`, `mac`, `browser`, `none`), `caption`, `sub`, `zoom` {`to`, `x`, `y`, `at`}, `taps` [{`at`, `x`, `y`}], `cursor` [{`at`, `x`, `y`, `click`}], `trimBefore` |
| `icon` | `src`, `name` |
| `end` | `line`, `cta` |

`seconds` on every beat. Coordinates are fractions of the screen; `at` is seconds into
the beat. Storyboard-level: `preset`, `transition` (`cut` default, `dissolve` for App
Store), `music`, `musicVolume`, `motionBlur`.

The template already implements the motion rules in `references/motion.md`. Read that
file before changing any timing, and change `src/motion.ts` rather than writing a
one-off curve in a component. Beyond the four beat types, write new components against
the same tokens: one current, the click causes the next thing.

A brand the detector could not read (it says so in `notes`) gets `overrides` in
`src/brand.json`: `accent`, `background`, `foreground`, `font`, `dark`.

## Check, then hand over

`bun tools/stills.ts`, open every still; `bun tools/render.ts --draft`; then the final
master with `bash tools/master.sh <Comp> <version>` (ProRes, then grain-tuned H.264 at
-14 LUFS; `--appstore` for Apple's limits) and `bun tools/check.ts <file>`. `references/qa.md` lists what to look at by eye and the
loudness target. Send a phone-sized copy with SendUserFile, say what was checked and what was not
(you cannot hear the audio), and tell the owner to unmute. See "Handing over" in qa.md.

For the App Store, make separate cuts (`AppStorePreview` and `AppStorePreviewIPad`: iPhone
886 x 1920, iPad 1200 x 1600, recordings only, no zoom, no device frame). Fill the takes,
taps, captions and music in `src/appstore.json` (`examples/cutling/AppStorePreview.tsx` is a
finished one), render with `--appstore`, and
upload with `scripts/asc-upload-preview.rb`. See `references/formats.md`.

## Formats

`references/formats.md`: six presets, the App Store rules (15-30 s, 30 fps, full-bleed
app content, dissolves, stereo AAC) and the encoder settings per target.
