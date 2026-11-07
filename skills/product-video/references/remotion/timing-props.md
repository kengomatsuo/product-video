<!-- remotion-dev/skills@a2824c67f8b4585c294a8101db9f9f0ad3c643f8 remotion-markup (timing-props), Remotion docs /docs/timing, /docs/sequence -> product-video references/remotion/timing-props.md -->
# Timing props

One set of props places and reshapes a layer in time. The Remotion docs call them shared
by all components; in practice they sit on: `Sequence`, `AbsoluteFill`, `Img`,
`CanvasImage`, `AnimatedImage`, `Solid`, `HtmlInCanvas`, `HtmlInCanvasMotionBlur`, `Gif`,
`Lottie`, `ThreeCanvas`, `Video` and `Audio` (the last two from `@remotion/media`). A
component that lacks them goes inside a `Sequence`, which has all of them
([sequencing.md](sequencing.md)).

| Prop | Meaning |
|---|---|
| `from` | frame of the parent timeline where the layer appears; its children count from 0 there |
| `trimBefore` | first frame of the layer's own timeline; the layer still appears at `from` |
| `durationInFrames` | how many frames of its own timeline are shown, counted from `trimBefore` |
| `playbackRate` | speed; the layer takes `durationInFrames / playbackRate` frames of the parent |
| `loop` | repeats the selected range until the parent ends |

```tsx
<Video src={staticFile('rec/home.mp4')} from={1 * fps} trimBefore={2 * fps}
  durationInFrames={3 * fps} playbackRate={2} />
```

Order of effect: `from` places, `trimBefore` picks the start, `durationInFrames` picks the
range, `playbackRate` stretches it, `loop` repeats it. The frame a child sees from
`useCurrentFrame()` is `trimBefore + (frame - from) * playbackRate`.

- Get `fps` from `useVideoConfig()` and write seconds as `n * fps` on the prop.
- `loop` needs a `durationInFrames`, except on `Video`, `Audio`, `Gif`, `AnimatedImage` and
  `Lottie`, which have their own length. `Img`, `CanvasImage` and `Solid` never change over
  time and take no `loop`.
- To end a clip early, use `durationInFrames`; do not cut the file.

## Versions

Check the template's pinned Remotion version before using a prop. `from` and
`durationInFrames` on `Video` and `Audio` need 4.0.446, `trimBefore` on `Sequence` 4.0.482,
and `playbackRate` on `Sequence` 4.0.528. The template pins 4.0.527, so a speed change on a
`Sequence` needs the version bump described in [index.md](index.md); `Video` and `Audio`
have taken `playbackRate` since 4.0.354.
