<!-- remotion-dev/skills@9682e994989f951c75912fbc49aa10332a512685 remotion-best-practices (router, remotion-docs, remotion-studio, remotion-upgrade) -> product-video references/remotion/index.md -->
# Remotion for product films

Remotion renders React components to video one frame at a time. These notes cover the
parts a product film uses. Which motion to make is decided in `../motion.md`; these files
say how to write it in Remotion. The template pins Remotion 4.0.527 in
`template/package.json`; the notes were distilled from the Remotion agent skill at that
version (2026-10-21).

| File | Read when |
|---|---|
| [compositions.md](compositions.md) | registering a film, a still or a scene; sizes, props, dynamic duration |
| [sequencing.md](sequencing.md) | placing things in time: `Sequence`, `Series`, local frames, premounting |
| [transitions.md](transitions.md) | cutting between scenes with `TransitionSeries`, overlap maths, light leaks |
| [timing.md](timing.md) | any `interpolate()`, easing, spring or scale animation |
| [video-and-images.md](video-and-images.md) | placing a recording, a still, a GIF or a Lottie; trim, speed, crop |
| [audio.md](audio.md) | music, effects, volume curves, audio-reactive visuals, silence |
| [fonts-and-text.md](fonts-and-text.md) | loading fonts, measuring and fitting text, highlights, safe areas |
| [captions.md](captions.md) | spoken-word captions from a voice track (word timing) |
| [effects-and-3d.md](effects-and-3d.md) | shader effects, `HtmlInCanvas`, three.js devices |
| [rendering.md](rendering.md) | Studio, stills, renders, alpha video, WebGL flags |

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
  `bunx remotion versions` to confirm. Pin an exact version.
- **Studio write-back markup** (`Interactive.Div`, inline-only `defaultProps`): useful when a
  person edits keyframes in Studio. The film template computes its timing from the
  storyboard, so it does not follow those rules.
