<!-- remotion-dev/skills@9682e994989f951c75912fbc49aa10332a512685 remotion-markup (timing, REFERENCE "General rules", measuring-dom-nodes) -> product-video references/remotion/timing.md -->
# Timing, easing and springs

Which curve and duration to use is decided in `../motion.md` and `template/src/motion.ts`.
This file covers the Remotion calls.

## interpolate

`interpolate(frame, inputRange, outputRange, options)` maps a frame to a value.
Without clamping it keeps going past the ends, so set both sides:

```ts
const opacity = interpolate(frame, [0, 0.3 * fps], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});
```

- `easing` takes `Easing.bezier(x1, y1, x2, y2)` (the CSS `cubic-bezier` numbers),
  `Easing.spring({ damping: 200 })` for a push that does not bounce, or `Easing.linear`.
- With more than two keyframes, pass an `easing` array of `n - 1` curves, one per segment:
  `interpolate(frame, [0, 1 * fps, 9 * fps, 10 * fps], [0, 1, 1, 0], { easing: [inCurve, Easing.linear, outCurve] })`.
- `output: 'perceptual-scale'` on a scale animation corrects for the way a linear scale
  looks slower as it grows. Add it to every scale tween.
- `posterize: 3` samples every third frame, a deliberate stepped look.
- Output ranges may be strings with units: `['0px 0px', '100px 100px']`, `['20deg', '90deg']`.

## spring

`spring({ frame, fps, config })` from `remotion` returns a 0 to 1 value that settles
by physics; `motion.ts` wraps it with the house configs (`damping`, `stiffness`, `mass`).
`springTiming` in [transitions.md](transitions.md) is the same idea for scene seams.

## Transform properties

Write `scale`, `translate` and `rotate` as separate CSS properties:

```tsx
style={{ scale: s, translate: `${x}px ${y}px`, rotate: `${deg}deg` }}
```

Use a `transform` string only for `skew()`, `perspective()` or a transform order that
matters.

## Measuring in a scaled frame

Studio and the Player scale the video container, so `getBoundingClientRect()` returns
scaled numbers. Divide by `useCurrentScale()`:

```tsx
const scale = useCurrentScale();
const rect = ref.current.getBoundingClientRect();
const width = rect.width / scale;
```
