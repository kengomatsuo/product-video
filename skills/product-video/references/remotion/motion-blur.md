<!-- remotion-dev/skills@a2824c67f8b4585c294a8101db9f9f0ad3c643f8 remotion-markup (motion-blur), Remotion docs /docs/motion-blur, /docs/motion-blur/html-in-canvas-motion-blur -> product-video references/remotion/motion-blur.md -->
# Motion blur

Whether a film blurs a move is a motion decision (`../motion.md`). This file covers the
Remotion call. Install: `bunx remotion add @remotion/motion-blur`.

`<HtmlInCanvasMotionBlur>` renders its children at several fractional frames inside a canvas
and averages the pixels. The Remotion docs name it the recommended route. It needs
**Remotion 4.0.529 or newer**; the template pins 4.0.527, so bump the version first
([index.md](index.md), Upgrading).

```tsx
import { HtmlInCanvasMotionBlur } from '@remotion/motion-blur';
const { width, height } = useVideoConfig();
<HtmlInCanvasMotionBlur width={width} height={height} shutterAngle={180} samples={8}>
  <MovingBox />
</HtmlInCanvasMotionBlur>
```

| Prop | Default | Range and meaning |
|---|---|---|
| `width`, `height` | required | canvas size in pixels, positive integers; use the composition size to cover the frame |
| `shutterAngle` | 180 | 0 to 360; at 180 the samples span half a frame centred on the current frame; 0 turns blur off |
| `samples` | 8 | integer 1 to 64; more is smoother and costs more in preview and render |
| `disabled` | false | one sample at the current frame, content stays in the canvas (4.0.530 and newer) |
| `from`, `durationInFrames`, `trimBefore`, `playbackRate`, `loop` | | the shared timing props ([timing-props.md](timing-props.md)) |

- Call `useCurrentFrame()` inside a child component, not in the component that renders the
  blur. The blur overrides the frame each child sees; a frame read outside it stays sharp.
- Samples before frame 0 or after the last frame clamp to the first or last frame.
- Preview in Studio needs HTML-in-canvas on: Chrome 149 or newer with
  `chrome://flags/#canvas-draw-element` set to Enabled, then a restart. Say so when a film
  uses it. A render needs nothing: Remotion's own Chrome has the flag on. Use that browser
  (do not pass `--browser-executable`).
- Nesting `HtmlInCanvas` and `HtmlInCanvasMotionBlur` is allowed only when
  `HtmlInCanvas.isNestingSupported()` returns true (Chrome 157.0.8080.0 or newer with the
  flag; server renders from Remotion 4.0.534). Otherwise keep one level.

Without the flag, `<CameraMotionBlur>` from the same package blurs by layered blending and
works in any browser, but the blending can shift colour and opacity. `<Trail>` repeats
earlier positions behind the current one and is a stylised look, not a camera exposure.
Details: `https://www.remotion.dev/docs/motion-blur.md`.
