import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import brand from './brand.json';

/* brand.json comes from detect-brand.ts; overrides are edited in by hand */
type B = {
  name: string;
  colors: { accent?: { hex: string }; background?: { hex: string }; foreground?: { hex: string } };
  overrides?: { accent?: string; background?: string; foreground?: string; font?: string; dark?: boolean };
  fontFiles?: { family: string; file: string; weight?: string; style?: string }[];
};
const b = brand as unknown as B;
const o = b.overrides ?? {};
const c = b.colors;

export const dark = o.dark ?? false;
export const theme = {
  name: b.name,
  accent: o.accent ?? c.accent?.hex ?? '#0A84FF',
  background: o.background ?? c.background?.hex ?? (dark ? '#0B0B0D' : '#F5F5F7'),
  foreground: o.foreground ?? c.foreground?.hex ?? (dark ? '#F5F5F7' : '#111114'),
  font: [o.font, b.fontFiles?.[0]?.family, '-apple-system', 'SF Pro Display', 'system-ui', 'sans-serif']
    .filter(Boolean).map((f) => (f!.includes(' ') ? `"${f}"` : f)).join(', '),
};

/* fonts copied into public/fonts by new_project.sh; the render waits on them */
export const fontsReady = Promise.all(
  (b.fontFiles ?? []).map((f) => loadFont({ family: f.family, url: staticFile(f.file), weight: f.weight ?? '100 900', style: f.style ?? 'normal' })),
);

/* colour with alpha from any CSS colour, via color-mix so oklch tokens work too */
export const alpha = (color: string, a: number) => `color-mix(in oklab, ${color} ${Math.round(a * 100)}%, transparent)`;
