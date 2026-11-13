<!-- remotion-dev/skills@a2824c67f8b4585c294a8101db9f9f0ad3c643f8 remotion-render, remotion-studio, remotion-markup (REFERENCE "Previewing", transparent videos) -> product-video references/remotion/rendering.md -->
# Studio, stills and renders

The pipeline's render steps run through `tools/render.ts`, `tools/stills.ts` and
`tools/master.sh` (see `SKILL.md`, phase 7). These are the underlying Remotion commands.

## Studio

Start Studio as soon as the project runs, before building the composition, and keep it open
so the user can watch. `bunx remotion studio --no-open` starts the preview and prints its
address; if one is running it prints that address and exits. With `--no-open`, open the
printed address in a browser and check that the composition's preview loads. Open a composition at `/<composition-id>`.
Flags: `--port=<n>`, `--log=<error|warn|info|verbose>`, `--force-new` (start a second
instance for the same project). Restart Studio after changing `remotion.config.ts`.

## Check a frame

`bunx remotion still <composition-id> --scale=0.25 --frame=30` renders one frame; `--frame`
counts from 0. Cheap for a layout or colour check on a small edit. The pipeline's
`bun tools/stills.ts` does this for every beat.

## Render

`bunx remotion render src/index.ts <composition-id> out/film.mp4` renders a video. The
options are listed at `https://www.remotion.dev/docs/cli/render.md`. Used by the template:
`--codec=h264`, `--crf`, `--video-bitrate`, `--audio-codec`, `--audio-bitrate`,
`--enforce-audio-track`, `--x264-preset`, `--scale`, `--props`. The settings per
destination are in `../formats.md`. Render only when the pipeline reaches that phase.

WebGL (the 3D devices, shader effects, light leaks, `HtmlInCanvas`) needs
`--gl=angle` or `Config.setChromiumOpenGlRenderer('angle')`, which the template sets.

Render with Remotion's own Chrome, including for `HtmlInCanvas` and motion blur: it has the
needed browser APIs and Remotion's fixes, and Remotion downloads and updates it. Do not set
`--browser-executable`, `browserExecutable` or `chromeMode` unless a person asks for another
browser. Studio preview of `HtmlInCanvas` is different: it runs in the person's Chrome and
needs the flag in [motion-blur.md](motion-blur.md).

Several single frames in one call: `bunx remotion render <id> out/frames --frames=0,30,90
--image-format=png` (a list of frames writes an image sequence; ranges like `0-99` join into
one video; 4.0.502 and newer).

## Transparent video

Two outputs, both with `--image-format=png`:

```bash
# ProRes 4444, for an editor
bunx remotion render --image-format=png --pixel-format=yuva444p10le --codec=prores --prores-profile=4444 Comp out.mov
# WebM VP9, for a web page
bunx remotion render --image-format=png --pixel-format=yuva420p --codec=vp9 Comp out.webm
```

In `remotion.config.ts` the same settings are `Config.setVideoImageFormat('png')`,
`Config.setPixelFormat(...)`, `Config.setCodec(...)` and `Config.setProResProfile('4444')`. A
composition can set defaults through `calculateMetadata` (`defaultCodec`,
`defaultVideoImageFormat`, `defaultPixelFormat`, `defaultProResProfile`). The template sets
`yuv420p`, so a transparent hero loop needs these overrides on that one render.

## Elsewhere

Lambda, Vercel Sandbox, Cloudflare and Docker rendering are not used here. If one is ever
needed, read `https://www.remotion.dev/docs/compare-ssr.md` first, store credentials in
`.env` and never paste secrets into chat.
