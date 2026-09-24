/* Verify a rendered file: container facts, destination rules, a contact sheet, and pops.
 *   bun tools/check.ts [--preset x] [file.mp4]
 * A pop is a frame whose change from the previous frame is far above the clip's norm
 * and does not sit on a beat boundary: a jump the eye reads as a glitch. */
import { existsSync } from 'node:fs';
import { PRESETS, beatStarts, boundaryFrames, totalFrames } from '../src/timing';
import { out, withPreset } from './lib';

const argv = process.argv.slice(2);
const s = withPreset(argv);
const file = argv.find((a) => a.endsWith('.mp4') || a.endsWith('.mov')) ?? out(s);
if (!existsSync(file)) { console.error(`no ${file}; render first`); process.exit(1); }
const p = PRESETS[s.preset];
const problems: string[] = [];

const probe = JSON.parse(Bun.spawnSync(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]).stdout.toString());
const v = probe.streams.find((x: any) => x.codec_type === 'video');
const a = probe.streams.find((x: any) => x.codec_type === 'audio');
const [n, d] = v.r_frame_rate.split('/').map(Number);
const fps = n / d, secs = parseFloat(probe.format.duration), frames = parseInt(v.nb_frames ?? '0');
const mbps = parseInt(probe.format.bit_rate) / 1e6;
console.log(`${file}: ${v.width}x${v.height} ${fps}fps ${secs.toFixed(2)}s ${frames} frames ${v.codec_name}/${v.profile} ${v.pix_fmt} ${mbps.toFixed(1)} Mbps audio=${a ? `${a.codec_name} ${a.channels}ch ${a.sample_rate}Hz` : 'none'}`);

if (v.width !== p.width || v.height !== p.height) problems.push(`size ${v.width}x${v.height}, preset wants ${p.width}x${p.height}`);
if (Math.abs(fps - p.fps) > 0.01) problems.push(`fps ${fps}, preset wants ${p.fps}`);
if (frames && frames !== totalFrames(s, p.fps)) problems.push(`${frames} frames, storyboard adds up to ${totalFrames(s, p.fps)}`);
if (v.pix_fmt !== 'yuv420p') problems.push(`pixel format ${v.pix_fmt}; players want yuv420p`);
if (s.preset.startsWith('appstore')) {
  if (secs < 15 || secs > 30) problems.push(`App Store previews run 15-30 s; this is ${secs.toFixed(1)} s`);
  if (fps > 30) problems.push('App Store previews max 30 fps');
  if (!a) problems.push('App Store previews need an audio track');
  else if (a.channels !== 2) problems.push(`App Store audio must be stereo; got ${a.channels} ch`);
  if (mbps > 12.5) problems.push(`bit rate ${mbps.toFixed(1)} Mbps; Apple targets 10-12`);
}

/* contact sheet: 12 frames evenly spaced */
const every = Math.max(1, Math.floor(frames / 12));
Bun.spawnSync(['ffmpeg', '-y', '-v', 'error', '-i', file, '-vf', `select='not(mod(n\\,${every}))',scale=480:-1,tile=4x3:padding=6:color=white`, '-frames:v', '1', 'out/sheet.png']);
console.log('contact sheet: out/sheet.png');

/* frame-to-frame change: mean |grey - previous grey| over raw 320x180 frames.
   (ffmpeg's tblend difference reported phantom 6.9 steps on identical frames) */
const W = 320, H = 180, N = W * H;
const raw = Bun.spawnSync(['ffmpeg', '-v', 'error', '-i', file, '-vf', `scale=${W}:${H},format=gray`, '-vsync', '0', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 30 }).stdout;
const ys: number[] = [];
for (let i = 1; i < raw.length / N; i++) {
  let sum = 0;
  for (let k = 0; k < N; k++) sum += Math.abs(raw[i * N + k] - raw[(i - 1) * N + k]);
  ys.push(sum / N);
}
const sorted = [...ys].sort((x, y) => x - y);
const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
/* transitions move a whole frame on purpose: skip their window */
const t = boundaryFrames(s, p.fps);
const cuts = new Set(beatStarts(s, p.fps).flatMap((b) => Array.from({ length: t + 3 }, (_, i) => b.start - 1 + i)));
const pops = ys.map((y, i) => ({ frame: i + 1, y })).filter((x) => x.y > Math.max(6, median * 8) && !cuts.has(x.frame));
if (pops.length) problems.push(`possible pops at frames ${pops.slice(0, 12).map((x) => `${x.frame} (${x.y.toFixed(1)})`).join(', ')}; look at a dense sheet around each`);

console.log(problems.length ? `\n${problems.length} problem(s):\n- ${problems.join('\n- ')}` : '\nNo problems found. Still open out/sheet.png and watch it once.');
process.exit(problems.length ? 1 : 0);
