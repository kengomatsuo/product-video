<!-- remotion-dev/skills@a2824c67f8b4585c294a8101db9f9f0ad3c643f8 remotion-best-practices (router, remotion-docs, remotion-studio, remotion-upgrade) -> product-video references/remotion/index.md -->
# Remotion for product films

Remotion renders React components to video one frame at a time. These notes cover the
parts a product film uses. Which motion to make is decided in `../motion.md`; these files
say how to write it in Remotion. The template pins Remotion 4.0.527 in
`template/package.json`. The notes were distilled from the Remotion agent skill (first at
the 4.0.527 content, then brought to remotion-dev/skills `a2824c6`, whose pages target
4.0.541) and checked against the Remotion docs. Where the skill and the docs differ, these
files follow the docs. Features newer than the pin are marked with their version.

| File | Read when |
|---|---|
| [compositions.md](compositions.md) | registering a film, a still or a scene; sizes, props, dynamic duration |
| [sequencing.md](sequencing.md) | placing things in time: `Sequence`, `Series`, local frames, premounting |
| [timing-props.md](timing-props.md) | `from`, `trimBefore`, `durationInFrames`, `playbackRate`, `loop` on any layer |
| [transitions.md](transitions.md) | cutting between scenes with `TransitionSeries`, overlap maths, light leaks |
| [timing.md](timing.md) | any `interpolate()`, easing, spring or scale animation |
| [video-and-images.md](video-and-images.md) | placing a recording, a still, a GIF or a Lottie; trim, speed, crop |
| [audio.md](audio.md) | music, effects, volume curves, audio-reactive visuals, silence |
| [fonts-and-text.md](fonts-and-text.md) | loading fonts, measuring and fitting text, highlights, safe areas |
| [captions.md](captions.md) | spoken-word captions from a voice track (word timing) |
| [effects-and-3d.md](effects-and-3d.md) | shader effects, `HtmlInCanvas`, three.js devices |
| [color-correction.md](color-correction.md) | exposure, white balance, levels, curves, LUTs on a recording |
| [motion-blur.md](motion-blur.md) | `HtmlInCanvasMotionBlur`, its defaults and the Chrome flag (needs 4.0.529) |
| [rendering.md](rendering.md) | Studio, stills, renders, alpha video, WebGL flags |
| [license.md](license.md) | when a company needs a paid Remotion licence |

## Rules that hold everywhere

- Every moving value comes from `useCurrentFrame()`. CSS `transition`, CSS `animation` and
  Tailwind `transition-*` / `animate-*` classes do not render correctly, because the
  renderer steps frames and the browser clock does not follow.
- Put static files in `public/` and reference them with `staticFile()`.
- Install Remotion packages with `bunx remotion add <package>`, which picks the version
  that matches the project. This covers `@remotion/*`, `mediabunny`, `zod`.
- Edits a person made in the project since your last read stay; if one looks odd, ask
  before overwriting it.
- Read a current docs page before using an API you have not used in this project. Add
  `.md` to any `https://www.remotion.dev/docs/<page>` address to get the Markdown source,
  for example `https://www.remotion.dev/docs/sequence.md`.

## Left out on purpose

- **Maps** (Mapbox, MapLibre, MapTiler, Cesium flyovers): a product film shows the app,
  never a geographic scene. Fetch the Remotion docs if a map is ever wanted.
- **Player, SaaS templates, Lambda, Vercel and container rendering**: films here render on
  the Mac with `tools/render.ts`. If renders ever need to leave the machine, start at
  `https://www.remotion.dev/docs/lambda.md`.
- **Upgrading**: change every `remotion` and `@remotion/*` version in
  `template/package.json` to one value (they must match), run `bun install`, then
  `bunx remotion versions` to confirm. Pin an exact version. Motion blur, `playbackRate` on
  a `Sequence` and `curves()` need a newer version than 4.0.527 (see their files).
- **Studio write-back markup** (`Interactive.Div`, `Interactive.create()`, `Track`,
  connected compositions, editable timeline structure, inline-only `defaultProps`,
  inline-only `effects` arrays): useful when a person edits keyframes and clips in Studio.
  The film template computes its timing from the storyboard, so it does not follow those
  rules. If a film is ever handed over for hand editing, read the Remotion docs on
  `Interactive` and `Track` first.
- **Right-to-left text**: see the last section of [fonts-and-text.md](fonts-and-text.md).
- **Custom and Lambda licensing questions beyond the summary**: read the live pages named in
  [license.md](license.md).
