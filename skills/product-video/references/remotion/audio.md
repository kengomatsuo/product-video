<!-- remotion-dev/skills@9682e994989f951c75912fbc49aa10332a512685 remotion-markup (audio, sfx, audio-visualization, silence-detection, voiceover) -> product-video references/remotion/audio.md -->
# Audio in Remotion

## Contents

- Audio component
- Delay, trim, volume
- Sound effects
- Audio-reactive visuals
- Finding silence
- Voiceover

Which track to pick and where cuts land on the bars is in `../audio.md`. This file is the
Remotion side.

## Audio component

`Audio` comes from `@remotion/media`. Several `<Audio>` elements layer.

```tsx
import { Audio } from '@remotion/media';
<Audio src={staticFile('music/track.mp3')} trimBefore={24 * fps} volume={0.8} />
```

## Delay, trim, volume

- `trimBefore` / `trimAfter` are frames of the source. The sound still starts at the
  start of its parent sequence; only the played slice changes. Wrapping in
  `<Sequence from={n}>` delays the start.
- `volume` is a number from 0 to 1 or a function `(f) => number`, where `f` counts from
  the first frame the audio plays, not from the composition start. The house fade is an
  `interpolate` over `f` (see `template/src/Promo.tsx`).
- `muted` can switch on a frame range: `muted={frame >= 2 * fps && frame <= 4 * fps}`.
- `playbackRate` (no reverse), `loop`, `loopVolumeCurveBehavior` and `toneFrequency`
  work as on `Video` ([video-and-images.md](video-and-images.md)). Pitch shift applies only
  to a server render, so Studio preview sounds different.

## Sound effects

`Audio` from `@remotion/sfx` plays the Remotion-hosted clips, for example
`https://remotion.media/whoosh.wav`, `whip.wav`, `mouse-click.wav`, `switch.wav`,
`shutter-modern.wav`, `ding.wav`, `page-turn.wav`. The same list holds meme sounds
that do not suit a product film. House effects, with licences, are in the shared audio
library named in `SKILL.md`; use those so a film's sound comes from a file with a known
licence.

## Audio-reactive visuals

`bunx remotion add @remotion/media-utils`. This changes how a visual reacts while the
frames render; `scripts/beats.ts` decides when things happen.

- `useWindowedAudioData({ src, frame, fps, windowInSeconds: 30 })` returns
  `{ audioData, dataOffsetInSeconds }`; `audioData` is null until loaded.
- `visualizeAudio({ fps, frame, audioData, numberOfSamples, optimizeFor: 'speed',
  dataOffsetInSeconds })` returns 0 to 1 values per frequency band; the first entries are
  bass. `numberOfSamples` is a power of two.
- Bass pulse: average the first 32 of 128 samples and use `1 + bass * 0.5` as a scale.
- `visualizeAudioWaveform` with `createSmoothSvgPath` draws a waveform path;
  `getWaveformPortion` returns `{ index, amplitude }` bars for a volume view.
- Low bands dominate. For balance, convert to decibels
  (`20 * Math.log10(value)`) and rescale between about -100 and -30.
- Compute `frame` once in the parent and pass it down. A child inside an offset
  `Sequence` that calls `useCurrentFrame()` itself gets a jump in the visual.

## Finding silence

Use for dead air at the head or tail of a recording or a voice take.

```bash
ffmpeg -i in.mov -map 0:a -af loudnorm=print_format=json -f null /dev/null
ffmpeg -i in.mov -map 0:a -af "silencedetect=noise=${THRESH}dB:d=0.5" -f null /dev/null
```

Take `input_thresh` from the first command as `THRESH`. Output lists `silence_start` and
`silence_end`. A first start above 0.5 s means no leading silence; silences closer than
0.2 s count as one block. Turn the edges into `trimBefore={Math.floor(leadingEnd * fps)}`
and `trimAfter={Math.ceil(trailingStart * fps)}`.

## Voiceover

Store one audio file per scene under `public/voiceover/`. Measure each with Mediabunny
([video-and-images.md](video-and-images.md)) inside `calculateMetadata` and size the
composition from the sum, subtracting transition overlaps. Upstream uses ElevenLabs
(`POST https://api.elevenlabs.io/v1/text-to-speech/<voiceId>` with an `xi-api-key`
header from `ELEVENLABS_API_KEY`); any text-to-speech source that yields a file works. A
promo film here usually has music and no voice, so add voiceover only when the brief asks.
