<!-- remotion-dev/skills@a2824c67f8b4585c294a8101db9f9f0ad3c643f8 remotion-captions (REFERENCE, transcribe-captions, display-captions, import-srt-captions) -> product-video references/remotion/captions.md -->
# Spoken-word captions

The film's own captions are short on-screen lines from the storyboard (`../copy.md`).
Use this file only when a take has a person speaking and the words must appear on time.

Captions are JSON in the `Caption` type from `@remotion/captions`
(`bunx remotion add @remotion/captions`):

```ts
type Caption = { text: string; startMs: number; endMs: number;
  timestampMs: number | null; confidence: number | null; pageBreakAfter?: boolean };
```

## Get captions

- **Transcribe**: `bunx remotion add @remotion/whisper-webgpu @huggingface/transformers
  mediabunny @mediabunny/server`. It runs Whisper on the GPU (`canUseWhisperWebGpu()` tells
  whether this machine can; the package needs 4.0.528 or newer in Node) and replaces the
  older `@remotion/install-whisper-cpp` route. In a script: call `registerMediabunnyServer()`,
  decode the clip to a 16 kHz mono `Float32Array` with Mediabunny (`WHISPER_WEBGPU_SAMPLE_RATE`
  is the rate), `downloadWhisperModel({ model })`, then `transcribe({ channelWaveform, model })`
  and `toCaptions({ whisperWebGpuOutput })`. Use `small.en` for English; a multilingual model
  such as `small` needs `language`, because it cannot detect one. In a browser,
  `resampleTo16Khz({ file })` makes the waveform. Transcribe each source file alone and write
  one JSON per file into `public/`; timestamps stay relative to the start of that source
  file, including parts the edit trims away.
- **Import**: `parseSrt({ input })` from `@remotion/captions` turns SRT text into captions.

## Show captions

1. Fetch the JSON inside a `useDelayRender()` hold (`delayRender` before, `continueRender`
   after, `cancelRender(e)` on error) so the first frame has the words.
2. `createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 1200 })` returns
   `pages`. A higher number puts more words on a page; a lower one goes word by word.
   `pageBreakAfter: true` ends a page early.
3. Render each page in a `<Sequence from={startMs / 1000 * fps} durationInFrames>`.
   The `startMs` are source-file times. Put the `Video` and the captions under one parent
   that carries the clip's `trimBefore`: the children then count frames from the trim point,
   so source times map straight onto frames with no offset ([sequencing.md](sequencing.md)).
   The duration is the time to the next page, capped at the switch interval; skip pages
   whose duration is 0 or less.
4. Inside a page, `page.tokens` carry `fromMs`, `toMs` and `text`. The current word is the
   token with `fromMs <= page.startMs + (frame / fps) * 1000 < toMs`; colour it.
5. Tokens begin with a space, so set `whiteSpace: 'pre'`.

Keep the caption component in its own file and render it beside the `Video` it belongs
to, inside the same `Sequence` or `TransitionSeries.Sequence`, with one JSON per video so
they stay in sync. Upstream suggests copying the Basic Captions element
(`https://www.remotion.dev/elements/captions/basic-captions.md`) as a start; the film's
caption look comes from the brand, so write the component to the storyboard instead.
