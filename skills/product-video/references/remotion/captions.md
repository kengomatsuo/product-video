<!-- remotion-dev/skills@9682e994989f951c75912fbc49aa10332a512685 remotion-captions (REFERENCE, transcribe-captions, display-captions, import-srt-captions) -> product-video references/remotion/captions.md -->
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

- **Transcribe**: `bunx remotion add @remotion/install-whisper-cpp`, then in a script call
  `installWhisperCpp({ to, version: '1.5.5' })`, `downloadWhisperModel({ model: 'medium.en',
  folder: to })` and `transcribe({ model, whisperPath: to, whisperCppVersion, inputPath,
  tokenLevelTimestamps: true })`, then `toCaptions({ whisperCppOutput })`. The input is a
  16 kHz WAV (`ffmpeg -i in.mp4 -ar 16000 in.wav -y`). Transcribe each clip alone and write
  one JSON file per clip into `public/`.
- **Import**: `parseSrt({ input })` from `@remotion/captions` turns SRT text into captions.

## Show captions

1. Fetch the JSON inside a `useDelayRender()` hold (`delayRender` before, `continueRender`
   after, `cancelRender(e)` on error) so the first frame has the words.
2. `createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 1200 })` returns
   `pages`. A higher number puts more words on a page; a lower one goes word by word.
   `pageBreakAfter: true` ends a page early.
3. Render each page in a `<Sequence from={startMs / 1000 * fps} durationInFrames>`.
   The duration is the time to the next page, capped at the switch interval; skip pages
   whose duration is 0 or less.
4. Inside a page, `page.tokens` carry `fromMs`, `toMs` and `text`. The current word is the
   token with `fromMs <= page.startMs + (frame / fps) * 1000 < toMs`; colour it.
5. Tokens begin with a space, so set `whiteSpace: 'pre'`.

Keep the caption component in its own file and render it beside the `Video` it belongs
to, with one JSON per video so they stay in sync.
