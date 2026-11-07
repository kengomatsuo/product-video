<!-- remotion-dev/skills@a2824c67f8b4585c294a8101db9f9f0ad3c643f8 remotion-markup (sequencing, timing-props, video-editing), Remotion docs /docs/sequence -> product-video references/remotion/sequencing.md -->
# Sequencing

`<Sequence from durationInFrames>` shows its children during a frame range. Inside it,
`useCurrentFrame()` restarts at 0, so a child animates the same wherever it is placed.

```tsx
<Sequence name="Title" from={30} durationInFrames={60} layout="none"><Title /></Sequence>
```

- `layout` defaults to an absolute-fill wrapper. `layout="none"` adds no wrapper (and
  forbids `style` and `className` on the sequence); use it inside a `ThreeCanvas` and wherever
  the wrapper would cover other layers.
- `name` labels the row in the Studio timeline.
- `premountFor={fps}` mounts the children a second early so images, video and fonts are
  ready on the first visible frame. Premount every sequence that holds media. The docs set a
  two-second premount as the Studio default from 4.0.535; a render needs the explicit prop.
- `trimBefore`, `playbackRate` and `loop` work as on any layer
  ([timing-props.md](timing-props.md)). With `trimBefore={10 * fps}` a child's first frame
  reads as frame 300.
- Sequences nest; each one's `from` is relative to its parent.
- `width` and `height` on a `Sequence` change the sizes its descendants read from
  `useVideoConfig()`.

## Choosing the boundary

Put timing on the layer itself when one layer is moved or trimmed alone (a `Video`, an
`Img`). Use a shared `Sequence` when several layers must keep the same clock: a recording
with its caption and a source-synchronised highlight share one `trimBefore`,
`durationInFrames` and `playbackRate`, set once on the parent. A caption beside a trimmed
`Video` does not inherit the trim; it drifts. For consecutive scenes use
`TransitionSeries` and put the same props on each `TransitionSeries.Sequence`.

## Series

`<Series>` plays items one after the other with no overlap. Each `<Series.Sequence
durationInFrames>` follows the previous. `offset={-15}` on a later item starts it 15 frames
before the previous one ends (a positive offset leaves a gap). The film template uses
`TransitionSeries` instead, because its seams overlap by design; see
[transitions.md](transitions.md).
