<!-- remotion-dev/skills@a2824c67f8b4585c294a8101db9f9f0ad3c643f8 remotion-markup (color-correction), Remotion docs /docs/effects/color-correction, /docs/effects/levels, /docs/effects/curves, /docs/effects/lut -> product-video references/remotion/color-correction.md -->
# Colour correction of footage

Use it when a recording needs matching exposure or white balance across takes, or a gentle
grade that keeps the app's own colours. The app's brand colours stay as recorded unless the
storyboard says otherwise. All effects go in the `effects` array of `Video`, `Img`,
`CanvasImage`, `AnimatedImage`, `Solid`, `Gif` or `HtmlInCanvas`; they run in array order.
Install: `bunx remotion add @remotion/effects`. Renders need the WebGL setting in
[rendering.md](rendering.md).

## colorCorrection

`colorCorrection()` from `@remotion/effects/color-correction` (4.0.509) does the primary
adjustments in one pass, in this order: exposure, white balance, tonal regions, contrast,
saturation, vibrance. Called with no arguments it changes nothing.

| Control | Range | Neutral |
|---|---|---|
| `exposure` | -5 to 5 stops | 0 |
| `temperature` | -1 (cooler) to 1 (warmer) | 0 |
| `tint` | -1 (greener) to 1 (magenta) | 0 |
| `shadows`, `highlights`, `blacks`, `whites` | -1 to 1 | 0 |
| `contrast` | multiplier, 0 or more, around `pivot` (0 to 1, default 0.5) | 1 |
| `saturation` | multiplier, 0 is grey | 1 |
| `vibrance` | -1 to 1, lifts muted colours most | 0 |

```tsx
<Video src={staticFile('rec/home.mp4')}
  effects={[colorCorrection({ exposure: 0.25, temperature: 0.1, contrast: 1.1 })]} />
```

The same steps exist alone when a different order is needed: `exposure()`, `whiteBalance()`,
`shadowsHighlights()`, `contrast()`, `saturation()`, `vibrance()`.

## levels and curves

- `levels()`: `blackPoint` and `whitePoint` (0 to 1, default 0 and 1, black below white),
  `gamma` (0.01 to 10, default 1, above 1 brightens midtones), `outputBlack` and
  `outputWhite` (0 to 1).
- `curves()` (4.0.537): `points` is 2 to 32 `[input, output]` pairs in 0 to 1 with rising
  inputs; `interpolation` is `'smooth'` (default) or `'linear'`; `amount` blends with the
  original (0 to 1, default 1). The default `[[0, 0], [1, 1]]` changes nothing.
- Both take `channel`: `'rgb'` (default), `'red'`, `'green'` or `'blue'`; stack calls to
  treat channels differently. Both keep alpha.

## lut

`lut({ content })` (4.0.526) applies a 3D `.cube` file; `content` is the file's text. Only
3D tables work: `LUT_3D_SIZE` is an integer from 2 to 256 followed by that size cubed in RGB
rows. 1D tables and other formats need converting first. There is no strength control;
`disabled: true` bypasses it. Put `colorCorrection()` before `lut()` when the table should
see corrected footage.

## Animating

Effects do not animate alone. Derive numeric props from `useCurrentFrame()` with
`interpolate()`; for `curves()` points, keep the inputs strictly rising on every frame.
Details: `https://www.remotion.dev/docs/color-correction.md`.
