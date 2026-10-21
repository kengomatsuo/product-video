<!-- remotion-dev/skills@9682e994989f951c75912fbc49aa10332a512685 remotion-render, remotion-studio, remotion-markup (REFERENCE "Previewing", transparent videos) -> product-video references/remotion/rendering.md -->
# Studio, stills and renders

The pipeline's render steps run through `tools/render.ts`, `tools/stills.ts` and
`tools/master.sh` (see `SKILL.md`, phase 7). These are the underlying Remotion commands.

## Studio

`bunx remotion studio --no-open` starts the preview and prints its address; if one is
running it prints that address and exits. Open a composition at `/<composition-id>`.
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
