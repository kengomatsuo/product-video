# product-video

A Claude skill for promo videos and App Store previews of your own apps. It records
the real product, reads the product's brand from its own files, and renders with
Remotion under a motion system whose every number cites a source.

## Install

### Claude app (claude.ai, desktop, mobile)

1. Download [product-video.zip](https://github.com/kengomatsuo/product-video/releases/latest/download/product-video.zip).
   Do not unzip it.
2. Turn on **Code execution and file creation** in
   [Settings > Capabilities](https://claude.ai/settings/capabilities).
3. In [Customize > Skills](https://claude.ai/customize/skills), click **+**, then
   **Create skill**, then **Upload a skill**, and choose the ZIP.

Pasting the GitHub link into a chat does not install it. Rendering needs network access
in the app's sandbox to install bun and Remotion. Recording the Simulator and
App Store upload only work in Claude Code on a Mac.

### Claude Code

```bash
claude plugin marketplace add https://github.com/kengomatsuo/product-video.git && claude plugin install product-video@product-video
```

The full HTTPS URL matters: the `kengomatsuo/product-video` shorthand clones over SSH and
fails without a GitHub SSH key. It is also listed in the `kengomatsuo-skills` marketplace
(https://github.com/kengomatsuo/agent-skills) as `product-video@kengomatsuo-skills`.

Claude Code only auto-updates Anthropic's own marketplaces unless told otherwise, so turn
it on once: `/plugin`, then **Marketplaces**, pick `product-video`, then **Enable auto-update**. Or
add the marketplace to `~/.claude/settings.json` with auto-update already on:

```json
"extraKnownMarketplaces": {
  "product-video": {
    "source": { "source": "git", "url": "https://github.com/kengomatsuo/product-video.git" },
    "autoUpdate": true
  }
}
```

With it on, every push reaches you in a session or two. By hand:
`claude plugin marketplace update product-video && claude plugin update <skill>@product-video`.


To rebuild the ZIP after a change: `bash scripts/package.sh`, then attach
`dist/product-video.zip` to a new GitHub release.

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
app-preview specifications. See NOTICE.

## Licence

MIT.
