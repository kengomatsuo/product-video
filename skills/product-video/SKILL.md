---
name: product-video
description: Make promo videos and App Store previews for your own software products, built from real recordings of the app and styled from the product's own brand files. Remotion renders them; a detector reads each project's accent colour, fonts, icon, screenshots and clips; capture scripts record the iOS Simulator or a Mac/browser window; a motion system with cited easing, cut-the-curve transitions, waterfall text and an oversized cursor drives every beat; checks verify size, frame rate, App Store rules and frame-to-frame pops. Use for launch videos, social cuts, site hero loops, App Store and Mac App Store previews, and feature announcements. Not for cartoons (clawd-video) or explainer lectures.
when_to_use: "Trigger phrases: promo video, launch video, app preview, App Store preview video, product video, demo reel, feature video, video for the site, Reels, Shorts, TikTok for the app, make a video of the app."
user-invocable: true
---

# Product promo videos

The screen is always the real product, recorded moving. Everything else (frame, type,
camera, transitions) is a layer on top, in the product's own brand. Remotion API details
live in Remotion's official skill (`remotion-dev/skills`, `remotion-best-practices`);
this skill decides what to make and how it should move.

## RESEARCH AND CAPTURE BEFORE ANY SCENE IS WRITTEN

1. **Brief.** One paragraph: the product, who watches, where it runs (preset), length, the
   one thing the viewer should remember. Write the approved facts and numbers, each with
   where it came from (README, code, store listing). Nothing else may appear on screen.
2. **Directions.** Write three directions in a sentence each, pick one, and name its
   signature move (PLM law 10). Look at `~/Shared/inspo/product-video-promo/` when it
   exists: 550+ frames of real promos, posters, App Store previews and tutorials, with
   notes on what to take from each.
3. **Scaffold.** `bun <skill>/scripts/new-project.ts <product-dir> <out-dir>`. It reads
   the brand (`detect-brand.ts`), copies the icon, fonts, screenshots and clips into
   `public/`, and writes a draft storyboard whose captions are placeholders.
4. **Capture.** Record every shot where the product does something:
   `capture-ios.sh`, `capture-mac.sh`, or goldie/argent flows. See `references/capture.md`.
   Screenshots are only for a screen that genuinely holds still.
5. **Copy.** Write each caption through `human-prose`, 2 to 5 words, verb and object, a
   fact the screen proves. See `references/copy.md`. Never ship a placeholder.
6. **Music.** Pick the track, run `scripts/beats.ts`, and choose the start point that puts
   its drop on the payoff. Scenes are then laid out in bars. See `references/audio.md`.

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

## Painted scenes

For a cartoon moment (a mascot, a storybook opener), `new-project.ts --painted` scaffolds
a watercolor scene with the installed `clawd-video` skill in `painted/`. Render it there
and drop the MP4 in as a `shot` with `device: "none"`. Its code stays in that skill.
