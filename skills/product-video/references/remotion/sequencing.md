<!-- remotion-dev/skills@9682e994989f951c75912fbc49aa10332a512685 remotion-markup (sequencing, REFERENCE "Delaying, trimming") -> product-video references/remotion/sequencing.md -->
# Sequencing

`<Sequence from durationInFrames>` shows its children during a frame range. Inside it,
`useCurrentFrame()` restarts at 0, so a child animates the same wherever it is placed.

```tsx
<Sequence name="Title" from={30} durationInFrames={60} layout="none"><Title /></Sequence>
```

- `layout` defaults to an absolute-fill wrapper. `layout="none"` adds no wrapper; use it
  inside a `ThreeCanvas` and wherever the wrapper would cover other layers.
- `name` labels the row in the Studio timeline.
- `premountFor={fps}` mounts the children a second early so images, video and fonts are
  ready on the first visible frame. Premount every sequence that holds media.
- `trimBefore` on a `Sequence` starts the children's clock later: with
  `trimBefore={10 * fps}` the child's first frame reads as frame 300.
- Sequences nest; each one's `from` is relative to its parent.

## Series

`<Series>` plays items one after the other with no overlap. Each `<Series.Sequence
durationInFrames>` follows the previous. `offset={-15}` on a later item starts it 15 frames
before the previous one ends (a positive offset leaves a gap). The film template uses
`TransitionSeries` instead, because its seams overlap by design; see
[transitions.md](transitions.md).

## Props shared by most layers

`from`, `durationInFrames` and `trimBefore` are accepted by `AbsoluteFill`, `Img`,
`AnimatedImage`, `CanvasImage`, `HtmlInCanvas`, `Solid`, `Sequence`, and by `Video`
and `Audio` from `@remotion/media`. A component without them goes inside a `Sequence`.
