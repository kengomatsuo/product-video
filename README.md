# product-video

A Claude Code skill for promo videos and App Store previews of your own apps. It records
the real product, reads the product's brand from its own files, and renders with
Remotion under a motion system whose every number cites a source.

## Install

```bash
claude plugin marketplace add kengomatsuo/product-video
```

```bash
claude plugin install product-video@product-video
```

Needs bun, ffmpeg, and Xcode for iOS capture. Remotion is free for individuals and
companies of up to three people; larger companies need a Remotion company licence
(remotion.dev/license).

## What it does

| Step | Tool |
|---|---|
| Read the brand: accent, fonts, icon, screenshots, clips | `scripts/detect-brand.ts` |
| Start a video project wired to that brand | `scripts/new-project.ts` |
| Record the iOS Simulator display, or a Mac/browser window | `scripts/capture-ios.sh`, `scripts/capture-mac.sh` |
| Render stills, drafts and finals in six presets | `template/tools/stills.ts`, `render.ts` |
| Verify size, fps, App Store rules and frame pops | `template/tools/check.ts` |

The motion rules and their sources are in `skills/product-video/references/motion.md`.

## Credits

The motion rules adapt ideas from HeyGen's HyperFrames skills (Apache-2.0) and
`product-launch-motion` by AbubakrChan (MIT). App Store numbers come from Apple's
app-preview specifications. Painted scenes run through `clawd-video` by aadil6971, which
is installed separately; none of its code is in this repository. See NOTICE.

## Licence

MIT.
