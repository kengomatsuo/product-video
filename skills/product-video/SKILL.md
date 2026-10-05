---
name: product-video
description: Makes promo videos and App Store previews for your own software products, from real recordings of the app in the product's own brand. Runs a gated pipeline (references, study, storyboard, animatic, build, checks) in Remotion with a cited motion system, and checks every render for size, frame rate, App Store rules, loudness and frame pops. Use for launch videos, social cuts (Reels, Shorts, TikTok), site hero loops, App Store and Mac App Store previews, feature announcements and demo reels, whenever someone asks for a video of an app. Not for explainer lectures.
user-invocable: true
---

# Product promo videos

The screen is always the real product, recorded moving. Everything else (frame, type,
camera, transitions) is a layer on top, in the product's own brand. Remotion API details
live in Remotion's official skill (`remotion-dev/skills`, `remotion-best-practices`);
this skill decides what to make and how it should move.

## The pipeline, in order. No phase is skipped

A film made without the first four phases is a slideshow; the owner rejected exactly
that on 2026-09-24. Each gate waits for the owner's approval.

**"Don't ask questions" never removes a gate.** The storyboard and the animatic are
deliverables sent to the owner, not questions. A coordinator delegating this skill passes
the gates through to the subagent and never writes "decide and finish"; a subagent told
to skip them stops at phase 4 and hands the storyboard back. Undirect's film skipped all
four phases under that instruction and came back as screenshots on Cutling's music
(2026-10-01).

Copy this checklist into the reply and tick it off. Each go-back line applies the moment
its check fails.

```
Pipeline progress:
- [ ] 0 Tools installed (Dependencies below); `bun <skill>/scripts/new-project.ts` ready
- [ ] 1 Gather: 250+ references saved with sources, on the topic and general
      Go back to 1 if the count is under 250 or a kind in references/research.md has no items.
- [ ] 2 Study: a note per item, copy tiered, films' cut times measured
      Go back to 1 if a note cannot say what to take; the item was the wrong one.
- [ ] 3 Plan: storyboard.md with brief, three directions, music, beat table in bars
      Go back to 2 if a direction or a caption cites no reference file.
- [ ] 4 Propose the storyboard to the owner  GATE
      Changes requested: edit the table, resend, wait. Never start phase 5 unapproved.
- [ ] 5 Wireframe: stills and an animatic on the real music, the screen box on the 3D device  GATE
      Pacing or composition rejected: return to 3 and change the table; never patch the wireframe.
- [ ] 6 Build: capture each take, replace each wire: box, stills after every scene
      A take misses its table row (wrong UI, short, hitches): back to capture.
- [ ] 7 Check loops 7a-7e (below) pass: stills, frame sheet, motion plot, check.ts, loudness
      Any failure: fix the cause, bump the version, re-render, repeat from 7a.
- [ ] 7f Hand over: phone copy, "unmute" in the caption, what was and was not checked
```

| # | Phase | Output | Read |
|---|---|---|---|
| 1 | **Gather** references on the topic (competitors, category) and general ones (best launch films, code, guidelines, prose, music for the mood); 250+ items, saved with sources | `<refs>/*/notes.md` | `references/research.md` |
| 2 | **Study** them: a note per item, the copy read and tiered, the films' cut times measured | notes filled in, `copy/lines.json` | `references/research.md`, `research/` |
| 3 | **Plan** the storyboard: brief, three directions from the references, the music picked from a sample reel, the beat table in bars | `storyboard.md` | `references/storyboard.md`, `references/audio.md`, `references/copy.md` |
| 4 | **Propose** the storyboard to the owner. GATE | the page or file sent | `references/storyboard.md` |
| 5 | **Wireframe**: the table in `storyboard.json` with `wire:` boxes, stills and an animatic on the real music. The wire box is the SCREEN of the real 3D device (`template/public/models/iphone.glb`, `ipad.glb`, `macbook.glb` through `Phone3D`), moving on the planned path with its spins and seams; a flat box hides the motion the owner is approving (Undirect, 2026-10-01). GATE | contact sheet, animatic | `references/storyboard.md` |
| 6 | **Build**: capture the shot list, replace each box with its take, build scene by scene | the film | the sections below, `references/capture.md` |
| 7 | **Check and hand over** | master, check report | `references/qa.md` |

`bun <skill>/scripts/new-project.ts <product-dir> <out-dir>` sets up the project before
phase 5: it reads the brand (`detect-brand.ts`), copies the icon, fonts, screenshots and
clips into `public/`. Its starter storyboard is a placeholder; the phase 3 table replaces it.

Captions are written in phase 3 from the trusted examples (`research/headlines.json`,
the product's own `copy/lines.json`), 2 to 5 words, verb and object, a fact the screen
proves, through `human-prose`. See `references/copy.md`. Capture rules are in
`references/capture.md`; screenshots are only for a screen that genuinely holds still.

## Dependencies

The scripts run on macOS (Simulator capture, Vision OCR, `say`). Install what is missing
before phase 1; check with `command -v <tool>`.

| Tool | Used by | Install |
|---|---|---|
| bun | every script and `tools/*.ts` | `brew install oven-sh/bun/bun` |
| ffmpeg, ffprobe | frame extraction, `check.ts`, `master.sh`, `beats.ts`, loudness | `brew install ffmpeg` |
| yt-dlp | downloading reference films for `refs-frames.sh` | `brew install yt-dlp` |
| Remotion 4.0.527, three.js, p5.brush | rendering; pinned in `template/package.json` | `bun install` in the generated project (`new-project.ts` runs it) |
| Xcode command line tools (`xcrun simctl`, `swift`, `swiftc`) | `capture-ios.sh`, `capture-mac.sh`, compiling `refs-ocr.swift` | `xcode-select --install` |
| RocketSim CLI (optional) | 60 fps Simulator capture and `rocketsim do` flows | see the `rocketsim` skill; `capture-ios.sh` falls back to `simctl` |
| goldie and argent (optional) | replayable Simulator flows | `kacperkapusciak/goldie`, `software-mansion/argent` on GitHub |
| Ruby gem `spaceship` | `asc-upload-preview.rb` | `gem install spaceship` |

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
the same tokens: one current, the click causes the next thing. Caption timing comes from
`research/timing.md` (reading time, holds, sources).

A brand the detector could not read (it says so in `notes`) gets `overrides` in
`src/brand.json`: `accent`, `background`, `foreground`, `font`, `dark`.

## Check, then hand over

Every render the owner sees, animatic included, goes through these loops. Each one is
check, fix, re-check; the film moves on only when the loop passes. A fix needs a new
render (`master.sh` never overwrites a version: bump `v1` to `v2`).

**7a Stills.** `bun tools/stills.ts`, open every still. Fix what is cropped, late or
wrong, re-run, open them again.

**7b Frame sheet.** A contact sheet at 4 frames a second or more over every device
entrance, seam, spin and exit, looked at in full. A handful of sampled moments missed a
MacBook whose lid popped in after its keyboard and whose screen floated off the display
(2026-10-01). Fix each defect, re-render, rebuild the sheet.

**7c Motion plot.** Sheets cannot show motion: plot each device's on-screen size and
position over time (or difference consecutive frames) and check every move has a target
and a visible size; a 3% repeating zoom passed the sheets the same day. Fix, re-plot.

**7d Render and `check.ts`.** `bun tools/render.ts --draft` for timing, then the final
master with `bash tools/master.sh <Comp> <version>` (ProRes, then grain-tuned H.264 at
-14 LUFS; add `--appstore` for Apple's limits) and `bun tools/check.ts [--preset x] <file>`.
It checks size, frame rate and count, pixel format, colour range, the App Store rules
(15-30 s, at most 30 fps, stereo audio, bit rate) and frame pops, and exits 1 with one
line per problem. For each line: change the cause in the composition or the render
settings, render the next version, run `check.ts` again. A pop line needs a dense
sheet around the frame before it is called a false alarm. Finish when it prints
"No problems found", then open `out/sheet.png` once.

**7e Loudness.** Measure the delivered file (`references/qa.md`, "Sound"): -14 LUFS plus
or minus 0.5, true peak at most -1 dBTP. Outside that, re-run `master.sh` as the next
version and measure again.

Then hand over: `references/qa.md` lists what to look at by eye and "Handing over". Send
a phone-sized copy with SendUserFile, say what was checked and what was not (you cannot
hear the audio), and tell the owner to unmute.

For the App Store, make separate cuts (`AppStorePreview` and `AppStorePreviewIPad`: iPhone
886 x 1920, iPad 1200 x 1600, recordings only, no zoom, no device frame). Fill the takes,
taps, captions and music in `src/appstore.json` (`examples/cutling/AppStorePreview.tsx` is a
finished one), render with `--appstore` and run loops 7a to 7e on it, then upload with
`scripts/asc-upload-preview.rb`. See `references/formats.md`.

## Reference files

Read the one that matches the step; each is linked here so none is nested.

`<library>` below is the shared promo research library built while making this skill (music,
easing, copy, YouTube transcripts). Its location on this machine is in
`~/.claude/skill-notes/product-video.md`; without that note, ask where it is.

| File | Read when |
|---|---|
| `references/research.md` | gathering and studying references (phases 1-2) |
| `references/storyboard.md` | planning, proposing, wireframing (phases 3-5) |
| `references/audio.md` | picking music and placing cuts and effects on the bars |
| `references/copy.md` | writing any caption |
| `references/capture.md` | recording takes |
| `references/motion.md` | touching any timing, curve or camera move |
| `references/devices-and-backgrounds.md` | changing the 3D devices or the background |
| `references/formats.md` | presets, App Store rules, encoder settings, upload |
| `references/qa.md` | checking and handing over |
| `research/timing.md` | timing a caption, hold or shot length |
| `research/timing-sources/` | checking a claim `research/timing.md` cites; one note per source |
| `research/pacing.md`, `research/launch-videos.md`, `research/youtube.md` | how real launch films cut, move and end |
| `research/appstore-previews.md`, `research/posters.md` | what store previews and panels show |
| `research/copy.md`, `research/headlines.json` | trusted headlines and the tells of AI copy |
| `research/easing.md` | curves and duration tokens with their sources |
| `research/music-for-promos.md`, `research/music-sync.md`, `research/audio-library.md` | music choice, cutting to the bar, licensed tracks |
| `research/dribbble-behance.md`, `research/github.md` | motion shots and promo code (low trust for copy) |
