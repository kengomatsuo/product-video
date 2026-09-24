/* Final render with the encoder settings each destination wants.
 *   bun tools/render.ts [--preset appstore-iphone] [--draft] */
import { mkdirSync } from 'node:fs';
import { out, run, withPreset } from './lib';

const argv = process.argv.slice(2);
const s = withPreset(argv);
const draft = argv.includes('--draft');
if (draft) s.motionBlur = false;

const appStore = s.preset.startsWith('appstore');
const flags = appStore
  /* Apple: H.264 High <= L4.0, 10-12 Mbps, stereo AAC 256 kbps, audio track required */
  ? ['--codec=h264', '--video-bitrate=11M', '--audio-codec=aac', '--audio-bitrate=256k', '--enforce-audio-track']
  : ['--codec=h264', `--crf=${draft ? 24 : 16}`, '--audio-codec=aac', '--audio-bitrate=320k', '--x264-preset=slow'];

mkdirSync('out', { recursive: true });
run(['bunx', 'remotion', 'render', 'src/index.ts', 'Promo', out(s), ...flags, `--props=${JSON.stringify(s)}`, ...(draft ? ['--scale=0.5'] : [])]);
console.log(`\nWrote ${out(s)}. Next: bun tools/check.ts${s.preset !== 'landscape' ? ` --preset ${s.preset}` : ''}`);
