<!-- remotion-dev/skills@a2824c67f8b4585c294a8101db9f9f0ad3c643f8 remotion-markup (effects, html-in-canvas, 3d, light-leaks) -> product-video references/remotion/effects-and-3d.md -->
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

`bunx remotion add @remotion/effects`. These take `effects={[...]}`: `Video` (from
`@remotion/media`), `Img`, `CanvasImage`, `AnimatedImage`, `Solid`, `HtmlInCanvas`, `Gif`,
`RemotionRiveCanvas` and the `@remotion/shapes` components (4.0.474 and newer). Plain HTML
elements, `AbsoluteFill` and `Sequence` do not: wrap their content in `HtmlInCanvas` and put
`effects` on the wrapper. Effects run in array order.

```tsx
import { blur } from '@remotion/effects/blur';
<Video src={staticFile('rec/home.mp4')} effects={[blur({ radius: 8 })]} />
```

Imports are `@remotion/effects/<slug>`; `uvTranslate()` and `xyTranslate()` come from
`@remotion/effects/translate`. Available, by kind:

- Colour and tone: `brightness`, `colorCorrection`, `colorKey`, `contrast`, `curves`,
  `duotone`, `exposure`, `grayscale`, `hue`, `invert`, `levels`, `linearGradient`,
  `linearGradientTint`, `lut`, `saturation`, `shadowsHighlights`, `thermalVision`, `tint`,
  `vibrance`, `whiteBalance`. Guidance in [color-correction.md](color-correction.md).
- Blur and trails: `blur`, `lightTrail`, `linearProgressiveBlur`, `radialProgressiveBlur`,
  `regionBlur`, `zoomBlur`.
- Light: `dropShadow`, `longShadows`, `glow`, `lightLeak`, `shine`, `starburst`, `vignette`.
- Distortion and transform: `barrelDistortion`, `chromaticAberration`, `cornerPin`,
  `fisheye`, `mirror`, `noiseDisplacement`, `scale`, `skew`, `tile`, `uvTranslate`, `wave`,
  `xyTranslate`.
- Texture and pattern: `burlap`, `checkerboard`, `contourLines`, `dotGrid`, `emboss`,
  `flannel`, `gridlines`, `halftone`, `halftoneLinearGradient`, `lines`, `liquidContours`,
  `noise`, `paper`, `pattern`, `rings`, `scanlines`, `speckle`, `tvSignalOff`, `waves`,
  `whiteNoise`, `zigzag`.
- Edges: `outline`, `roughenEdges`, `shrinkwrap`, `tear`.
- Pixelate and dissolve: `evolve`, `linearProgressivePixelate`, `pixelate`, `pixelDissolve`,
  `radialProgressivePixelate`, `venetianBlinds`.

Fetch `https://www.remotion.dev/docs/effects.md` for the props of one. Some arrived after
the template's pin (4.0.527): `curves` and `longShadows` need 4.0.537.

Most effects use WebGL2. Renders need `Config.setChromiumOpenGlRenderer('angle')` (the
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
`chrome://flags/#canvas-draw-element` on; tell the user when a film depends on it, and
check that the render uses Remotion's own Chrome ([rendering.md](rendering.md)), which has the
flag on. Nest two only when `HtmlInCanvas.isNestingSupported()` is true (Chrome
157.0.8080.0 or newer). `onPaint({ canvas, elementImage })` draws with
`ctx.drawElementImage(elementImage, 0, 0)`; for WebGL, set up in `onInit` (return a cleanup
function) and upload with `gl.texElementImage2D`. `onPaint` may be async; the frame waits
for it. A blur on moving content is `HtmlInCanvasMotionBlur` ([motion-blur.md](motion-blur.md)).

## Three.js

`bunx remotion add @remotion/three`. `template/src/Phone3D.tsx` and `Devices.tsx` apply the last two:

- All 3D content sits inside `<ThreeCanvas width height>` (use `useVideoConfig()` for the
  sizes) with lights.
- Nothing moves on its own. Drive rotation and position from `useCurrentFrame()`.
  `useFrame()` from `@react-three/fiber` is forbidden; it flickers in a render.
- A `<Sequence>` inside a `ThreeCanvas` must use `layout="none"`.
- Wrap asynchronous loads (models, textures) in `delayRender()` / `continueRender()`, as
  the template does.
