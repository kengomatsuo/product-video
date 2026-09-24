import { readFileSync } from 'node:fs';
import { PRESETS, type Preset, type Storyboard } from '../src/timing';

/* width / height of an image or video, read by ffprobe */
function aspectOf(file: string): number | undefined {
  const r = Bun.spawnSync(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:stream_side_data=rotation', '-of', 'json', file]);
  const st = JSON.parse(r.stdout.toString() || '{}').streams?.[0];
  if (!st?.width) return undefined;
  const turned = Math.abs(st.side_data_list?.[0]?.rotation ?? 0) === 90;
  return turned ? st.height / st.width : st.width / st.height;
}

/* the browser cannot measure files, so each shot's aspect travels in the props */
export const storyboard = (): Storyboard => {
  const s: Storyboard = JSON.parse(readFileSync(new URL('../src/storyboard.json', import.meta.url), 'utf8'));
  for (const b of s.beats)
    if (b.type === 'shot' && !b.aspect && !/^https?:/.test(b.src)) {
      const a = aspectOf(new URL(`../public/${b.src}`, import.meta.url).pathname);
      if (a) b.aspect = Math.round(a * 10000) / 10000;
      else console.warn(`could not measure public/${b.src}`);
    }
  return s;
};

/* --preset x overrides the storyboard's preset */
export function withPreset(argv: string[]) {
  const s = storyboard();
  const i = argv.indexOf('--preset');
  if (i >= 0) {
    const p = argv[i + 1] as Preset;
    if (!PRESETS[p]) throw new Error(`unknown preset ${p}; one of ${Object.keys(PRESETS).join(', ')}`);
    s.preset = p;
  }
  return s;
}

export function run(cmd: string[]) {
  console.log('$ ' + cmd.join(' '));
  const r = Bun.spawnSync(cmd, { stdout: 'inherit', stderr: 'inherit' });
  if (r.exitCode !== 0) process.exit(r.exitCode ?? 1);
}

export const out = (s: Storyboard) => `out/${s.slug}-${s.preset}.mp4`;
