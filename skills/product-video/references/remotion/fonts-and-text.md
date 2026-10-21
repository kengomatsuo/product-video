<!-- remotion-dev/skills@9682e994989f951c75912fbc49aa10332a512685 remotion-markup (local-fonts, google-fonts, measuring-text, text-highlights), remotion-create (video-layout, tailwind) -> product-video references/remotion/fonts-and-text.md -->
# Fonts and text

## Contents

- Loading fonts
- Measuring and fitting text
- Highlights and annotations
- Size and safe area

## Loading fonts

The film uses the product's own font, so the usual path is a local file:
`bunx remotion add @remotion/fonts`, put the file in `public/`, then

```ts
import { loadFont } from '@remotion/fonts';
await loadFont({ family: 'Brand', url: staticFile('fonts/Brand-Bold.woff2'), weight: '700' });
```

Options: `family` and `url` (required), `format` (read from the extension), `weight`,
`style`, `display`. Load each weight with the same `family` name, in one
`Promise.all`. `template/src/theme.ts` does this for the brand's font files and exports
`fontsReady`, which `calculateMetadata` awaits so the first frame already has the font.

A Google font that the brand really uses: `bunx remotion add @remotion/google-fonts`, then
`const { fontFamily, waitUntilDone } = loadFont('normal', { weights: ['400', '700'],
subsets: ['latin'] })` from `@remotion/google-fonts/<FontName>`. List only the weights
and subsets used. It holds the render until the font is ready.

## Measuring and fitting text

`bunx remotion add @remotion/layout-utils`. Load the font first, then measure with the
same family, size, weight and letter spacing that the element renders with.

- `measureText({ text, fontFamily, fontSize, fontWeight })` returns `{ width, height }`
  and caches results. `validateFontIsLoaded: true` throws if the font is missing.
- `fitText({ text, withinWidth, fontFamily, fontWeight })` returns `{ fontSize }`; cap it
  with `Math.min` so a short caption does not become huge.
- `fillTextBox({ maxBoxWidth, maxLines })` then `box.add({ text, fontFamily, fontSize })`
  returns `{ exceedsBox }`, to test whether a caption fits its lines.
- Use `outline` for a debug box; padding and border change the measured size.
- DOM sizes inside a scaled preview need the `useCurrentScale()` division in
  [timing.md](timing.md).

## Highlights and annotations

`bunx remotion add @remotion/rough-notation` gives `<Highlight>`, `<Circle>`,
`<Underline>`, `<StrikeThrough>`, `<CrossedOff>`, `<Box>` and `<Bracket>`, each wrapping
the text. They take `color` and `progress`; drive `progress` with
`interpolate(frame, [15, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })`.
Highlight and Circle suit a hand-marked look; a product brand with a clean system may
reject it.

## Size and safe area

The upstream rule of thumb for a 1080-pixel-wide frame: keep key text at least 80 px from
the sides and 100 px from the top and bottom; headline at least 84 px, supporting text at
least 44 px; scale with the width. Decide what the viewer should notice first and build
the frame around it. This is the floor for a plain frame. The App Store sizes and caption
rules in `../formats.md` and `../copy.md` override it where they differ.
