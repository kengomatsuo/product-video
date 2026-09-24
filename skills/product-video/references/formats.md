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

- 15 to 30 seconds, at most 30 fps, at most 500 MB.
- H.264 High Profile up to Level 4.0 at 10-12 Mbps, or ProRes 422 HQ. `.mov`, `.m4v`, `.mp4`.
- Stereo audio, AAC 256 kbps, 44.1 or 48 kHz; the render forces an audio track.
- Portrait or landscape on iPhone; Mac previews are landscape only.
- Up to three previews per device size.
- Show only content from inside the app. So the App Store presets play captures full-bleed
  with no device frame and no invented UI.
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

## The promo film is not an App Store preview

Checked against Apple on 2026-09-24 (developer.apple.com app preview specifications and
App Review Guideline 2.3.4): a preview is 15-30 s, at most 30 fps, 886 x 1920 or 1920 x 886
for the 6.9-inch iPhone, H.264 10-12 Mbps with 256 kbps stereo AAC, and "may only use
video screen captures of the app itself", with narration and text overlays allowed. A 3D
device, other devices and a 45 s 60 fps landscape cut all fail it. Make the App Store cut
as its own composition, designed for portrait: `template/src/AppStorePreview.tsx` puts a
360 px caption band on the moving background and the recording below in a rounded screen
at the capture's own aspect (700 x 1521 inside 886 x 1920), so it never reads as a crop of
the landscape film. Render with `bash tools/master.sh AppStorePreview v1 --appstore`.
No zoom into the recording (it crops the app) and no device frame: Apple's App Preview
page says previews "must show only content within the app itself" (checked 2026-09-24).
A still hold is its own segment with a constant `playbackRate`: changing the rate inside
a segment re-times all of it and showed the segment's first frame.
