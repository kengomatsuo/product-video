<!-- remotion-dev/skills@a2824c67f8b4585c294a8101db9f9f0ad3c643f8 remotion-markup (transitions, light-leaks, multi-scene-video) -> product-video references/remotion/transitions.md -->
# Transitions

Install: `bunx remotion add @remotion/transitions` (the template already lists it).

`<TransitionSeries>` holds `TransitionSeries.Sequence` scenes and, between them,
either of two cut-point devices:

- `TransitionSeries.Transition` with `presentation` and `timing`. Both neighbouring scenes
  play together during it, so it shortens the film.
- `TransitionSeries.Overlay` with `durationInFrames` and an optional `offset` (positive is
  later, negative earlier). It draws an effect over the cut and leaves the length alone.
  An overlay cannot sit next to a transition or another overlay.

```tsx
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}><SceneA /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
  <TransitionSeries.Sequence durationInFrames={60}><SceneB /></TransitionSeries.Sequence>
</TransitionSeries>
```

Presentations: `fade`, `slide` (`direction`: `"from-left"`, `"from-right"`, `"from-top"`,
`"from-bottom"`), `wipe`, `flip`, `clockWipe`, each from
`@remotion/transitions/<name>` (`clock-wipe` for the last). Timings:
`linearTiming({ durationInFrames })` and `springTiming({ config: { damping: 200 }, durationInFrames })`.

## Rules at the seams

- A transition or an overlay sits between two `TransitionSeries.Sequence` scenes. Two
  overlays cannot touch, and a transition cannot touch an overlay; put a scene between them.
- An overlay is centred on the cut: half its frames before, half after, and `offset` slides
  it. It must stay inside the two neighbouring scenes.
- `name` on a scene labels its Studio row. From 4.0.533 the `TransitionSeries` itself takes a
  `durationInFrames` that caps its length.
- Put `trimBefore` and `durationInFrames` for a scene's recording and its captions on the
  `TransitionSeries.Sequence`, so both move together ([sequencing.md](sequencing.md)).

## Custom presentation

A presentation is `{ component, props }`. The component wraps both scenes and receives
`children`, `presentationDirection` (`'entering'` or `'exiting'`), `presentationProgress`
(0 to 1, shaped by the timing) and `passedProps`; type it with
`TransitionPresentationComponentProps<Props>` from `@remotion/transitions`. A slide-in
returns the exiting scene untouched and moves the entering one with
``translate: `${(1 - presentationProgress) * 100}% 0` `` inside an `overflow: hidden` box.
Use it as `presentation={{ component: SlideIn, props: {} }}`.

## Length

Total frames = sum of scene lengths minus the sum of transition lengths. Two 60-frame
scenes with a 15-frame transition run 105 frames. Overlays add nothing. Read a transition's
length with `timing.getDurationInFrames({ fps })`; for a `springTiming` with no
`durationInFrames` the value depends on `fps`, because it is the time the spring takes to
settle. Feed the total to `calculateMetadata` ([compositions.md](compositions.md)).

## Light leak overlay

Needs Remotion 4.0.500 or newer and `bunx remotion add @remotion/effects`. Apply
`lightLeak()` from `@remotion/effects/light-leak` to a `<Solid width height>` through its
`effects` array and drive `progress` from 0 to 1 over the overlay (the leak grows for the
first half and retracts for the second). Options: `progress` (default 0.5), `seed` (pattern),
`hueShift` in degrees (0 is yellow-orange, 120 green, 240 blue), `disabled`. Effects do
not animate by themselves. For the overlay slot, wrap the `Solid` in a component that reads
its own frame and passes `progress`, then place it as `<TransitionSeries.Overlay
durationInFrames={20}>`. The effect uses WebGL2, so the render needs the `angle` setting
in [rendering.md](rendering.md). Whether a leak suits the brand is a motion decision; see
`../motion.md`.
