<!-- remotion-dev/skills@9682e994989f951c75912fbc49aa10332a512685 remotion-markup (REFERENCE "Media components", embedding-videos, images, gifs, lottie, cropping, ffmpeg), remotion-multimedia -> product-video references/remotion/video-and-images.md -->
# Video, images and animated assets

## Contents

- Recordings with Video
- Still images
- Animated images and Lottie
- Cropping
- Reading duration and size
- FFmpeg

## Recordings with Video

`Video` comes from `@remotion/media` (`bunx remotion add @remotion/media`; the template
lists it). It decodes the exact frame for each render frame, which is why a recording stays
in sync under a 3D device (see `../devices-and-backgrounds.md`).

```tsx
import { Video } from '@remotion/media';
<Video src={staticFile('rec/home.mp4')} trimBefore={2 * fps} trimAfter={10 * fps}
  playbackRate={1} muted objectFit="cover" style={{ width: '100%', height: '100%' }} />
```

- `src` is `staticFile(...)` or a remote URL.
- `trimBefore` and `trimAfter` count **frames** of the source. (One upstream page says
  seconds in its prose while its code multiplies by `fps`; the code is right, and
  `template/src/components.tsx` passes frames.) Trimming this way is non-destructive.
- To start later in the film, wrap in `<Sequence from>`. The video appears when the
  sequence starts.
- `volume` is 0 to 1 or a function of the frame the clip has played. `muted` silences it.
- `playbackRate` speeds or slows it. Reverse playback is not supported.
- `loop` repeats; `loopVolumeCurveBehavior` is `"repeat"` (frame count restarts) or
  `"extend"` (it keeps counting, for one fade across loops).
- `toneFrequency` (0.01 to 2) shifts pitch and only works in a server render.
- `effects={[...]}` takes shader effects ([effects-and-3d.md](effects-and-3d.md)).

## Still images

- `<Img src={staticFile('a.png')} style={{ width, height, objectFit: 'cover' }} />` for a
  plain image. Remotion waits for it to load before the frame is taken.
- `<CanvasImage>` draws to a canvas and takes `effects`.
- Build a path from state with a template literal: ``staticFile(`icons/${active ? 'on' : 'off'}.svg`)``.
- `getImageDimensions(url)` from `remotion` returns `{ width, height }`; call it in
  `calculateMetadata` to size a composition to an image.

## Animated images and Lottie

- `<AnimatedImage src width height fit playbackRate loopBehavior />` plays a GIF, APNG,
  WebP or AVIF on the Remotion clock. `fit` is `fill`, `contain` or `cover`;
  `loopBehavior` is `loop`, `pause-after-finish` or `clear-after-finish`. A remote file
  needs CORS. It works in Chrome and Firefox only; `<Gif>` from `@remotion/gif` is the
  fallback and `getGifDurationInSeconds()` there reports a GIF's length.
- Lottie: `bunx remotion add @remotion/lottie`, fetch the JSON inside a
  `delayRender()` / `continueRender()` pair (call `cancelRender(err)` on failure), then
  render `<Lottie animationData style />`.

## Cropping

`cropLeft`, `cropRight`, `cropTop` and `cropBottom` are ratios from 0 to 1 and exist on
`Img`, `CanvasImage`, `AnimatedImage`, `HtmlInCanvas`, `Solid`, `Video` (from
`@remotion/media`), `Gif` and a `Sequence` with `layout="absolute-fill"`. They can be
interpolated. Do not combine them with `clipPath`.

## Reading duration and size

Mediabunny reads a file without a decode. Install with `bunx remotion add mediabunny`.

```ts
import { Input, ALL_FORMATS, UrlSource } from 'mediabunny';
const input = new Input({ formats: ALL_FORMATS, source: new UrlSource(src) });
const seconds = await input.computeDuration();
const track = await input.getPrimaryVideoTrack();       // null when there is no video
const { displayWidth, displayHeight } = track!;
```

In Node or Bun, swap `UrlSource` for `FileSource` (it takes a `File`). Mediabunny's
overview for agents is `https://mediabunny.dev/llms.txt`.

## FFmpeg

`bunx remotion ffmpeg ...` and `bunx remotion ffprobe ...` run copies bundled with
Remotion. This skill's scripts use the system `ffmpeg` (see Dependencies in `SKILL.md`).
To cut a standalone file, re-encode (`-c:v libx264 -c:a aac`); a stream copy leaves frozen
frames at the start. For a cut inside the film, use `trimBefore` / `trimAfter`.
