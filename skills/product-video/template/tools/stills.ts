/* PNGs of every beat just after it settles and at its middle, to LOOK at before a full render.
 *   bun tools/stills.ts [--preset vertical] [--at 1.5,4.2]   (seconds)
 * Bundles once, then renders each frame from the same bundle. */
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { PRESETS, beatStarts } from '../src/timing';
import { withPreset } from './lib';

const argv = process.argv.slice(2);
const s = withPreset(argv);
const fps = PRESETS[s.preset].fps;
const at = argv.indexOf('--at');
const frames = at >= 0
  ? argv[at + 1].split(',').map((x) => ({ label: `t${x}s`, frame: Math.round(parseFloat(x) * fps) }))
  : beatStarts(s, fps).flatMap((b, i) => [
      { label: `${i + 1}-${b.type}-in`, frame: b.start + Math.round(fps * 0.35) },
      { label: `${i + 1}-${b.type}-mid`, frame: b.mid },
    ]);

mkdirSync('out/stills', { recursive: true });
const serveUrl = await bundle({ entryPoint: resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: 'Promo', inputProps: s });
for (const f of frames) {
  const output = `out/stills/${s.preset}-${f.label}.png`;
  await renderStill({ composition, serveUrl, output, frame: Math.min(f.frame, composition.durationInFrames - 1), inputProps: s });
  console.log(output);
}
console.log(`\n${frames.length} stills. Open every one before rendering.`);
process.exit(0); // bun may keep the renderer alive otherwise
