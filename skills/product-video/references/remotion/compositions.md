<!-- remotion-dev/skills@9682e994989f951c75912fbc49aa10332a512685 remotion-markup (compositions, calculate-metadata, parameters, multi-scene-video), remotion-create -> product-video references/remotion/compositions.md -->
# Compositions

A `<Composition>` names one renderable video: component, `width`, `height`, `fps` and
`durationInFrames`. `template/src/Root.tsx` registers the film (its size and length come from
`calculateMetadata`) and the two App Store previews.

```tsx
<Composition id="Promo" component={Promo} width={1920} height={1080} fps={60}
  durationInFrames={600} defaultProps={{ title: 'Hello' }} />
```

- `defaultProps` must be JSON-serialisable (`Date`, `Map`, `Set` and `staticFile()`
  results also work). Declare a component's props with `type`, not `interface`, so the
  default values are type-checked.
- `<Folder name="Social">` groups compositions in the Studio sidebar and nests. A folder
  name takes letters, digits and hyphens only.
- `<Still id width height component />` is a one-frame composition. It needs no `fps` or
  `durationInFrames`. Poster frames and store panels use it.
- A composition inside another: wrap it in `<Sequence width height durationInFrames>`. The
  inner component then sees those sizes from `useVideoConfig()`.

## Dynamic duration, size and props

`calculateMetadata` on a composition runs before the render and may return
`durationInFrames`, `width`, `height`, `fps`, `props`, `defaultOutName` and
`defaultCodec`. Use it when the answer depends on a file or on fetched data. A fixed value
belongs on the `<Composition>`.

```tsx
const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props, abortSignal }) => {
  const seconds = await getVideoDuration(props.videoSrc);      // see video-and-images.md
  return { durationInFrames: Math.ceil(seconds * 60) };
};
```

`abortSignal` cancels a stale fetch when props change in Studio. A film cut from several
recordings sums their durations with `Promise.all`. With `TransitionSeries`, subtract the
overlaps (see [transitions.md](transitions.md)).

## Parameters

Add `schema={z.object({...})}` (from `zod`; install with `bunx remotion add zod`) and
Studio shows an editable props panel. The top level must be a `z.object()`. For a colour
picker use `zColor()` from `@remotion/zod-types`.

## Scenes as files

A film of several scenes puts each scene in its own component file and joins them in a
`TransitionSeries` or `Series`. Registering each scene as its own composition inside a
`<Folder>` lets you open and render one scene alone.

## Starting a bare project

`bunx create-video@latest --yes --blank --no-tailwind <folder>` then `bun install`. The
product-video template replaces this step; `scripts/new-project.ts` generates the project.
Tailwind is allowed when installed, with the animation rule in [index.md](index.md).
