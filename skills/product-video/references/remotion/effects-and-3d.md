<!-- remotion-dev/skills@9682e994989f951c75912fbc49aa10332a512685 remotion-markup (effects, html-in-canvas, 3d, light-leaks) -> product-video references/remotion/effects-and-3d.md -->
# Effects and 3D

## Contents

- Choosing an effect route
- The effects array
- Custom effects
- HtmlInCanvas
- Three.js

## Choosing an effect route

Try in this order: plain HTML and CSS; then an `effects` array on the element itself
(`Video`, `CanvasImage`, `Solid`) or on content wrapped in `HtmlInCanvas`;
then a custom effect. Whether the effect belongs in the film is a motion decision
(`../motion.md`): an effect on every action, never decoration.

## The effects array

`bunx remotion add @remotion/effects`. Canvas-based components take `effects={[...]}`:
`Video` (from `@remotion/media`), `Solid`, `CanvasImage`, `HtmlInCanvas`.

```tsx
import { blur } from '@remotion/effects/blur';
<Video src={staticFile('rec/home.mp4')} effects={[blur({ radius: 8 })]} />
```

Imports are `@remotion/effects/<slug>`; `uvTranslate()` and `xyTranslate()` come from
`@remotion/effects/translate`. Available: `brightness`, `contrast`, `colorKey`, `duotone`,
`grayscale`, `hue`, `invert`, `saturation`, `tint`, `linearGradient`, `linearGradientTint`,
`thermalVision`, `blur`, `linearProgressiveBlur`, `radialProgressiveBlur`, `zoomBlur`,
`dropShadow`, `glow`, `lightTrail`, `evolve`, `venetianBlinds`, `mirror`, `scale`,
`uvTranslate`, `xyTranslate`, `barrelDistortion`, `chromaticAberration`, `fisheye`,
`cornerPin`, `wave`, `burlap`, `emboss`, `dotGrid`, `halftone`, `noise`,
`noiseDisplacement`, `paper`, `roughenEdges`, `pattern`, `pixelate`, `pixelDissolve`,
`scanlines`, `speckle`, `shine`, `shrinkwrap`, `vignette`, `contourLines`,
`checkerboard`, `halftoneLinearGradient`, `gridlines`, `whiteNoise`, `tvSignalOff`,
`lines`, `rings`, `waves`, `zigzag`, `lightLeak`, `starburst`. Fetch
`https://www.remotion.dev/docs/effects.md` for the props of one.

Effects use WebGL2. Renders need `Config.setChromiumOpenGlRenderer('angle')` (the
template's `remotion.config.ts` sets it) or `--gl=angle` on the CLI. Effects do not
animate on their own; interpolate their numeric props from `useCurrentFrame()`.

## Custom effects

`createEffect()` from `remotion` makes a reusable effect that sits in the same array.
Prefer it to `HtmlInCanvas onPaint` when the effect has parameters or stacks with others.
Fields: `type` (reverse-DNS id), `label`, `documentationLink` (URL or `null`), `backend`
(`"2d"`, `"webgl2"` or `"webgpu"`), `calculateKey(params)` (a string covering every
parameter that changes the output), `setup(target)` (build state or return `null`),
`apply({ source, target, width, height, params, state, flipSourceY })`, `cleanup(state)`,
`schema` (an `InteractivitySchema` for Studio controls) and `validateParams`. Use `"2d"`
for filters and pixel work; use WebGL2 for shader maths. Keep defaults identical in the
schema and in the code that resolves params, reset 2D context state after drawing
(`filter`, `globalAlpha`, transforms), and keep alpha unless the look needs to change it.
Keep project effects in `src/effects/`.

## HtmlInCanvas

`<HtmlInCanvas width height onPaint onInit>` draws its children into a canvas so
Canvas 2D or WebGL can post-process them. It needs Chrome 149 or newer with
`chrome://flags/#canvas-draw-element` on; tell the owner when a film depends on it, and
check that the render browser has it. Do not nest two. `onPaint({ canvas, element,
elementImage })` draws with `ctx.drawElementImage(elementImage, 0, 0)` and sets
`element.style.transform` to the returned transform; for WebGL, set up in `onInit` (return a
cleanup function) and upload with `gl.texElementImage2D`. `onPaint` may be async; the
frame waits for it.

## Three.js

`bunx remotion add @remotion/three`. `template/src/Phone3D.tsx` and `Devices.tsx` apply the last two:

- All 3D content sits inside `<ThreeCanvas width height>` (use `useVideoConfig()` for the
  sizes) with lights.
- Nothing moves on its own. Drive rotation and position from `useCurrentFrame()`.
  `useFrame()` from `@react-three/fiber` is forbidden; it flickers in a render.
- A `<Sequence>` inside a `ThreeCanvas` must use `layout="none"`.
- Wrap asynchronous loads (models, textures) in `delayRender()` / `continueRender()`, as
  the template does.
