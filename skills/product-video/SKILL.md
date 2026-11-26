---
name: product-video
description: "Makes promo films and App Store previews of your own app in Remotion, from real recordings and motion graphics, with a storyboard and checked renders. Use for launch videos, social cuts, site hero loops, store previews, demo reels and explainers."
user-invocable: true
---

# Product promo videos

A shot that claims what the product does today is a real recording, because an invented one is a
false advert; where no recording exists the designer fills with motion graphics and the UI it
imagines. Everything else (frame, type, camera, transitions) is a layer on top, in the product's
own brand. Remotion API details
live in `references/remotion/` (start at [index.md](references/remotion/index.md));
this skill decides what to make and how it should move.

## The pipeline

A film made without the first four phases is a slideshow. The storyboard and the animatic are
sent to the user as pictures and a clip when they exist and the build carries on; the work
stops only for a pick that is the user's alone, such as music by ear.

Each go-back line applies the moment its check fails.

```
0 Tools installed (Dependencies below); `bun <skill>/scripts/new-project.ts` ready
1 Gather abundantly: the product's category and the best work in any category (film, animation, stills, prose, music), each saved with its source and what to take from it, because a film drawn from a few rivals comes out as their average
2 Study: a note per item, copy tiered, films' cut times measured
      Go back to 1 if a note cannot say what to take; the item was the wrong one.
3 Plan: storyboard.md with brief, directions, music, beat table in bars
      The storyboard shows as many directions as the designer has; each says what it takes from a reference and what is its own.
      A film asked for as motion graphics takes its look and motion from the references' own language (camera, depth, morphs, type, colour world), never from the product's last film: a storyboard drawn in the last film's look gets built in it, and flat screens cropped on a ground read to the owner as cropped recordings even when every pixel is drawn.
      The film shows how the product is really turned on (its real control, recorded), or it is a false advert.
      A film for YouTube ends on a still end card of 5 s or more for end-screen elements.
      A vertical social cut (TikTok, Reels, Shorts, X) is composed for the whole 1080 x 1920 frame and may run under the platforms' overlays; only what must be read to follow the film stays inside the safe box in `references/formats.md` ("Vertical safe zone"), which the designer judges by.
      The press that turns the product on or uses it is shown long enough that a first-time viewer sees which control it is and what it changed.
      The viewer sees the press cause its result, and each page of a montage reads as a new screen with its title in frame, because pages swapped under a fixed crop read as glitches.
      Frame 0 of every social cut is its best still, since X, Slack and Discord use it as the thumbnail. Each sound means one thing through the film, so a viewer learns it: a repeated element keeps its cue, timed to the rendered frames. The storyboard opens on a one-line concept that differs from the app's last film.
      A product that has an approved film keeps that film's sounds for the same actions; typing gets no sound unless a real keyboard recording exists, since a stand-in click reads as fake.
      The end card is composed for the whole frame, not shrunk into the safe box.
      Accents, wipes and badges use the product's own brand colours (its icon and site), never a colour borrowed from the meme or reference the format came from.
      A frame at delivered size shows which control is pressed and what the press changed, and no camera move is faster than a viewer can follow.
      A logo on screen is the product's finished icon, never a redraw in code. An Icon Composer package is rendered with Apple's ictool so its glass and light stay; an exported flat PNG does not count.
      Every shot of a platform's preview shows that platform's own recording under the overlays, and a take is sheeted end to end before any of it is ruled out.
      A platform's cut is as finished as the flagship: no layer or staging is dropped because the cut is secondary, and a film for one device family shows only that family. Dead time is cut from a take before it is used, and a real domain or name is hidden before anyone is shown the clip.
      Of several attempts at a pointer move, use the straightest. Better: record with `scripts/capture-mac-clean.swift` (compile with `swiftc -parse-as-library`), which leaves the cursor out and logs its path and clicks, then draw a smooth pointer that glides to each logged click. Delete the output file first; AVAssetWriter will not overwrite.
      Script the take before asking anyone to perform it. Inside a browser page, use Playwright with a synthetic cursor. For a real Safari window with an extension, WebDriver's windows are isolated and marked, so post native clicks (needs Accessibility) and record with the cursor left out.
      A fictional brand in a take is name-checked (registered domain, web search) before filming. Mac takes run in full-screen Safari on its own desktop. `scripts/mac-click.swift` posts a real click: hover 0.5 s first, set the click state to 1 or a toolbar button opens its menu, and keep the pointer on the button about 2 s before moving it.
      Before every scripted click, read the front window and tab title and stop unless it names the take's page: a tab another process opens takes the click meant for the film, and a sign-in or approval page acts on it.
      Before any take, check the installed build's version against the current release and open the screen being filmed; an old copy films the wrong product.
4 Send the storyboard to the user
      Its first line names the film's use. A film the user calls a "preview" is checked against the App Store preview rules in `references/formats.md` (at most 30 s, at most 30 fps, the accepted size); a storyboard that breaks them says so in its first line, before any drafting.
      Changes requested: edit the table and resend.
5 Wireframe: stills and an animatic on the real music, sent to the user
      Pacing or composition rejected: return to 3 and change the table; never patch the wireframe.
6 Build: capture each take, replace each wire: box, stills after every scene
      A take misses its table row (wrong UI, short, hitches): back to capture.
      iOS takes record only on the device queue's iPhone or iPad: lease it (`device-queue.ts lease iphone|ipad`, export DEVICE_QUEUE_TICKET), and `scripts/film-device.sh up iphone|ipad` prints its UDID for `capture-ios.sh`; never create, boot or record on another simulator.
7 Check loops 7a-7e (below) pass: stills, frame sheet, motion plot, check.ts, loudness
      Any failure: fix the cause, bump the version, re-render, repeat from 7a.
7f Hand over: phone copy, "unmute" in the caption, what was and was not checked
      Every format the storyboard plans (16:9, 9:16 portrait, square) is rendered and checked before hand-over; a planned cut left unbuilt is a failed 7f.
      A vertical social cut is laid under each platform's overlay sheet and the designer judges it; only the film's key line and the end card's price or badge must be clear of a platform button.
      Text on a 3D label is read on a frame zoomed to 100%: a seam, flap edge or border crossing a letter fails.
      After the last take, release the lease (`device-queue.ts release "$DEVICE_QUEUE_TICKET"`).
```

| # | Phase | Output | Read |
|---|---|---|---|
| 1 | **Gather** references abundantly: on the topic (competitors, category) and the best work in any category (launch films, animation, stills, code, guidelines, prose, music for the mood), each saved with its source | `<refs>/*/notes.md` | `references/research.md` |
| 2 | **Study** them: a note per item, the copy read and tiered, the films' cut times measured | notes filled in, `copy/lines.json` | `references/research.md`, `research/` |
| 3 | **Plan** the storyboard: brief, the directions, the music picked from a sample reel, the beat table in bars | `storyboard.md` | `references/storyboard.md`, `references/audio.md`, `references/copy.md` |
| 4 | **Send** the storyboard to the user | the page or file sent | `references/storyboard.md` |
| 5 | **Wireframe**: the table in `storyboard.json` with `wire:` boxes, stills and an animatic on the real music, sent to the user. When the film stages a 3D device (`template/public/models/iphone.glb`, `ipad.glb`, `macbook.glb` through `Phone3D`), the wire box is that device's screen, moving on the planned path with its spins and seams; a flat box hides the motion the user is judging | contact sheet, animatic | `references/storyboard.md` |
| 6 | **Build**: capture the shot list, replace each box with its take, build scene by scene | the film | the sections below, `references/capture.md` |
| 7 | **Check and hand over** | master, check report | `references/qa.md` |

`bun <skill>/scripts/new-project.ts <product-dir> <out-dir>` sets up the project before
phase 5: it reads the brand (`detect-brand.ts`), copies the icon, fonts, screenshots and
clips into `public/`. Its starter storyboard is a placeholder; the phase 3 table replaces it.

Captions are written in phase 3 after reading the trusted examples (`research/headlines.json`,
the product's own `copy/lines.json`) to hear what human launch copy sounds like: a complete thought with its actor,
readable in the time it holds, a fact the screen proves, a line only this product could carry, through `human-prose`.
See `references/copy.md`. Capture rules are in
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
| RocketSim CLI (optional) | 60 fps Simulator capture and `rocketsim do` flows | `rocketsim --help`; `capture-ios.sh` falls back to `simctl` |
| goldie and argent (optional) | replayable Simulator flows | `kacperkapusciak/goldie`, `software-mansion/argent` on GitHub |
| Ruby gem `spaceship` | `asc-upload-preview.rb` | `gem install spaceship` |
| Listening models (CLAP, AST, Qwen2-Audio; about 7.6 GB in `~/.cache/audio-tools`) | `scripts/sfx/sfx.py`, `scripts/sfx/mix.py`: picking sound effects by description (`references/audio.md` section 3) | `zsh <skill>/scripts/sfx/setup.sh` |

## The film, not the slideshow

A storyboard of stills in a frame is a slideshow. A film moves: nothing on screen is a still
in a frame, the viewer sees every touch, and picture and music arrive together, in a master
with no banding. `examples/cutling/Film.tsx` shows one way (six scenes on a 121.5 BPM bar
grid, recordings playing on a 3D device that keeps moving across cuts) and its pieces
(`Phone3D`, `Background`, `Words`, the `path`/`pan`/`settle` rig) are there to take or leave:
to use them, copy the file into `src/` and register it in `src/Root.tsx`. Its timings and
`rec/` takes belong to the example.
See `references/devices-and-backgrounds.md`.
An explainer or hybrid film also follows `references/explainer.md`.

A how-to guide never makes the viewer wait: still frames between presses are cut and the product's own animations
play whole, because a recording that waits loses its viewer. A take is captured with the product's animations whole
(slowed through the DevTools Animation domain, or virtual time), since a screencast at 10-15 fps turns every sheet
into a jump cut.

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
file before changing any timing. The template's tokens in `src/motion.ts` are its
defaults; a film that wants another motion character changes them in one place so the
film stays consistent with itself. Caption timing comes from
`research/timing.md` (reading time, holds, sources).

A brand the detector could not read (it says so in `notes`) gets `overrides` in
`src/brand.json`: `accent`, `background`, `foreground`, `font`, `dark`.

## Check, then hand over

Every render the user sees, animatic included, goes through these loops. Each one is
check, fix, re-check; the film moves on only when the loop passes. A fix needs a new
render (`master.sh` never overwrites a version: bump `v1` to `v2`). A still or render runs
under a time limit, and when it ends no `chrome-headless-shell` of that project is left
(`pgrep -f chrome-headless-shell`).

**7a Stills.** `bun tools/stills.ts`, open every still. Fix what is cropped, late or
wrong, re-run, open them again.

**7b Frame sheet.** A contact sheet at 4 frames a second or more over every device
entrance, seam, spin and exit, looked at in full. Sample densely; a few chosen moments
miss one-frame entrance errors. Fix each defect, re-render, rebuild the sheet.
The sheet covers the whole film, every beat and every language, before any render is sent;
a sheet over a few chosen beats lets clipping layers and z-fights through. In a layered three.js scene every transparent plane gets
`depthWrite: false` and an explicit `renderOrder` back to front, and coplanar labels get
`polygonOffset`, so no layer can cut through another mid-move. A viewer with no technical
knowledge reads each shot with the sound off: words large enough for a phone, one idea,
nothing between the eye and the subject.

**7c Motion plot.** No action is cut off before the viewer has seen its result, unless a move is carried across the cut on purpose: difference the frames over each beat's last 0.4 s to find motion still running at the cut. Sheets cannot show motion: plot each device's on-screen size and
position over time (or difference consecutive frames) and check every move has a target
and a visible size; a small repeating zoom passes a sheet. Fix, re-plot.

**7d Render and `check.ts`.** `bun tools/render.ts --draft` for timing, then the final
master with `bash tools/master.sh <Comp> <version>` (ProRes, then grain-tuned H.264 at
-14 LUFS; add `--appstore` for Apple's limits) and `bun tools/check.ts [--preset x] <file>`.
Both renders run in a cloud session, since a render takes the memory every session on the
Mac shares: commit, then `bun ~/.claude/scripts/cloud-run.ts --files out -- bun tools/render.ts --draft`
(the same for `master.sh`); the files come back under `--out`, and check.ts runs on them here.
It checks size, frame rate and count, pixel format, colour range, the App Store rules
(15-30 s, at most 30 fps, stereo audio, bit rate) and frame pops, and exits 1 with one
line per problem. For each line: change the cause in the composition or the render
settings, render the next version, run `check.ts` again. A pop line needs a dense
sheet around the frame before it is called a false alarm. Finish when it prints
"No problems found", then open `out/sheet.png` once.

**7e Loudness.** Measure the delivered file (`references/qa.md`, "Sound"): -14 LUFS plus
or minus 0.5 with true peak at most -1 dBTP, or about -16 for a quiet build with one lift
(`research/audio-library.md`, "Recommendation"); the hand-over states which. Outside that,
re-run `master.sh` as the next version and measure again.

Then hand over: `references/qa.md` lists what to look at by eye and "Handing over". Send
a phone-sized copy with SendUserFile, say what was checked and what was not (you cannot
hear the audio), and tell the user to unmute.

For the App Store, make separate cuts (`AppStorePreview` and `AppStorePreviewIPad`: iPhone
886 x 1920, iPad 1200 x 1600, Mac 1920 x 1080, 15 to 30 s, real recordings under the film's overlays). Fill the takes,
taps, captions and music in `src/appstore.json` (`examples/cutling/AppStorePreview.tsx` is a
finished one), render with `--appstore` and run loops 7a to 7e on it, then upload with
`scripts/asc-upload-preview.rb`. See `references/formats.md`.

## Reference files

Read the one that matches the step; each is linked here so none is nested.

`<library>` below is an optional local research library (music, easing, copy, YouTube
transcripts) that the user may name. The skill works without it.

| File | Read when |
|---|---|
| `references/research.md` | gathering and studying references (phases 1-2) |
| `references/storyboard.md` | planning, proposing, wireframing (phases 3-5) |
| `references/audio.md` | picking music and placing cuts and effects on the bars |
| `references/copy.md` | writing any caption |
| `references/capture.md` | recording takes |
| `references/explainer.md` | an explainer or a hybrid film: ideas as objects, feeling, joining animation to real recordings |
| `references/motion.md` | touching any timing, curve or camera move |
| skill `expressive-motion` | one worked motion language (the stya hero film's), to study when a film wants that character |
| `references/remotion/` ([index](references/remotion/index.md)) | writing or fixing any Remotion code: compositions, sequencing, transitions, `interpolate`, video and image layers, audio, fonts, effects, 3D, rendering |
| `references/devices-and-backgrounds.md` | changing the 3D devices or the background |
| `references/formats.md` | presets, App Store rules, encoder settings, upload |
| `references/qa.md` | checking and handing over |
| `research/timing.md` | timing a caption, hold or shot length |
| `research/timing-sources/` | checking a claim `research/timing.md` cites; one note per source |
| `research/pacing.md`, `research/launch-videos.md`, `research/youtube.md` | how real launch films cut, move and end |
| `research/appstore-previews.md`, `research/posters.md` | what store previews and panels show |
| `research/copy.md`, `research/headlines.json` | text read from the reference frames, tiered by source, and the tells of AI copy |
| `research/easing.md` | curves and duration tokens with their sources |
| `research/music-for-promos.md`, `research/music-sync.md`, `research/audio-library.md` | music choice, cutting to the bar, licensed tracks |
| `research/dribbble-behance.md`, `research/github.md` | motion shots and promo code (low trust for copy) |
