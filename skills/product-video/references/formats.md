# Formats

| Preset | Size | fps | For | Transition |
|---|---|---|---|---|
| `landscape` | 1920 x 1080 | 60 | site hero, YouTube, X | cut the curve |
| `vertical` | 1080 x 1920 | 60 | Reels, Shorts, TikTok, Stories | cut the curve |
| `square` | 1080 x 1080 | 60 | feeds, LinkedIn | cut the curve |
| `appstore-iphone` | 886 x 1920 | 30 | App Store preview, every iPhone size | dissolve |
| `appstore-ipad` | 1200 x 1600 | 30 | App Store preview, iPad 13" | dissolve |
| `appstore-mac` | 1920 x 1080 | 30 | Mac App Store preview | dissolve |

One storyboard renders to any preset: `bun tools/render.ts --preset vertical`.

## App Store previews (Apple, app-preview specifications and guidance)

When the user asks for a preview cut of an animated film, build the cut with its animation, layers and touches. Quote Apple's text once as a review risk, then build it; never replace the animation with recordings-only, and never refuse. Many live previews carry motion graphics.

- 15 to 30 seconds, at most 30 fps, at most 500 MB. Aim for 29.5 s, ending on a bar line of the music plus its ring-out.
- H.264 High Profile up to Level 4.0 at 10-12 Mbps, or ProRes 422 HQ. `.mov`, `.m4v`, `.mp4`.
- Stereo audio, AAC 256 kbps, 44.1 or 48 kHz; the render forces an audio track.
- Portrait or landscape on iPhone; Mac previews are landscape only.
- Up to three previews per device size.
- Apple's text says a preview shows only content from inside the app and films no fingers on a device. Report that once as a review risk; the cut stays a hybrid.
- Apple asks for straightforward transitions such as dissolves and fades, and text that
  stays on screen long enough to read.

`tools/check.ts` fails an App Store render that breaks the length, frame rate, audio or
bit-rate rule.

## Encoder settings (tools/render.ts)

| Target | Settings |
|---|---|
| App Store | H.264, 11 Mbps, AAC 256 kbps, audio track enforced |
| Everything else | H.264, CRF 16, x264 preset slow, AAC 320 kbps, PNG frames, yuv420p |
| Draft | `--draft`: half scale, CRF 24, no motion blur |

Every render is a new file: rename the last one before rendering over it.

## The App Store preview is a short hybrid cut

Make it a separate composition for each device, about 29.5 s, 30 fps. Real recordings from that platform carry every shot, with the explainer's overlays, cards, touches and visualisations on top (`references/explainer.md`). A longer or 60 fps film stays a promotional film and is delivered as one.

| Device | Size | Upload type |
|---|---|---|
| iPhone | 886 x 1920 portrait, accepted for the 6.9" class and scaled for smaller ones | `IPHONE_69` (the API calls it `IPHONE_67`) |
| iPad | 1200 x 1600 portrait | `IPAD_PRO_3GEN_129` |
| Mac | 1920 x 1080, landscape only | `DESKTOP` |

Shot plan that fits 30 s, on the music's bars:

| Share of the cut | Shots |
|---|---|
| First 45% | the problem, one shot per way it happens, 3 to 4 shots of 2 to 3 s |
| On the music's lift | the real control pressed, recorded on that platform, about 4 s |
| Next 30% | the same problems failing, in the same framing |
| Last 25% | the real result list or settings, then the end card |

The default poster frame is at 5 s, so set one showing the product working. Up to three previews per device and language; a language without its own uses the next best language's. Read each upload back, and retry a poster frame that fails with a server error.

A still hold is its own segment with a constant `playbackRate`: changing the rate inside a segment re-times all of it and showed the segment's first frame.

`template/src/AppStorePreview.tsx` is the plain starting point (a caption band over the recording). Render with `bash tools/master.sh AppStorePreview v1 --appstore`.

## Uploading previews

Other App Store Connect work (builds, metadata, TestFlight) belongs to the house
`app-store-connect` skill, and store listing copy to `app-store-aso`.

`scripts/asc-upload-preview.rb <video> <PREVIEW_TYPE> <bundle-id> <version> [poster-frame]` (run from the app's `fastlane/`, which
holds `asc_api_key.json`) opens the next version if none is editable, then uploads into the
primary locale: `IPHONE_67` (886 x 1920) and `IPAD_PRO_3GEN_129` (1200 x 1600, the same 3:4
as an iPad Pro 13-inch capture, so the recording fits whole). Previews only attach to an
editable version, and a new version stays unsubmitted until the user submits it.

Confirm every Apple rule in this file against Apple's current App Preview page when
uploading.
