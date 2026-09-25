#!/usr/bin/env bun
/**
 * Scaffold a promo project for a product, wired to that product's own brand.
 *
 *   bun new-project.ts <product-dir> <out-dir> [--no-install]
 *
 * Copies the Remotion template, runs detect-brand.ts, copies the icon, brand fonts,
 * screenshots and clips into public/, and writes a starter storyboard from them.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';

const SKILL = resolve(import.meta.dir, '..');
const args = process.argv.slice(2);
const install = !args.includes('--no-install');
const [productArg, outArg] = args.filter((a) => !a.startsWith('--'));
if (!productArg || !outArg) {
  console.error('usage: bun new-project.ts <product-dir> <out-dir> [--no-install]');
  process.exit(2);
}
const product = resolve(productArg), out = resolve(outArg);
if (existsSync(join(out, 'package.json'))) { console.error(`${out} already has a project`); process.exit(1); }

cpSync(join(SKILL, 'template'), out, { recursive: true, filter: (p) => !p.includes('node_modules') && !p.includes('/out/') });
mkdirSync(join(out, 'public/captures'), { recursive: true });
mkdirSync(join(out, 'public/fonts'), { recursive: true });

const detect = Bun.spawnSync(['bun', join(SKILL, 'scripts/detect-brand.ts'), product]);
if (detect.exitCode !== 0) { console.error(detect.stderr.toString()); process.exit(1); }
const brand = JSON.parse(detect.stdout.toString());

/* icon */
if (brand.icon) {
  const file = 'icon' + extname(brand.icon);
  cpSync(join(product, brand.icon), join(out, 'public', file));
  brand.iconFile = file;
}

/* the first brand family with files on disk becomes the video's type */
brand.fontFiles = [];
const family = brand.fonts.find((f: any) => f.files.some((x: string) => existsSync(join(product, x))));
if (family) {
  for (const f of family.files.filter((x: string) => existsSync(join(product, x)) && !/-ext\b|cyrillic|greek|vietnamese/i.test(x)).slice(0, 4)) {
    const name = basename(f);
    cpSync(join(product, f), join(out, 'public/fonts', name));
    brand.fontFiles.push({ family: family.family, file: `fonts/${name}`, style: /italic/i.test(name) ? 'italic' : 'normal' });
  }
}

/* screenshots arrive ranked by detect-brand: English first, framed last */
const shots = brand.screenshots.slice(0, 8);
const copied = shots.map((s: string, i: number) => {
  const name = `${String(i + 1).padStart(2, '0')}-${basename(s).replace(/[^\w.-]+/g, '_')}`;
  cpSync(join(product, s), join(out, 'public/captures', name));
  return `captures/${name}`;
});
for (const c of brand.clips.slice(0, 3)) {
  cpSync(join(product, c), join(out, 'public/captures', basename(c)));
  copied.push(`captures/${basename(c)}`);
}
writeFileSync(join(out, 'src/brand.json'), JSON.stringify(brand, null, 2) + '\n');

/* starter storyboard: a draft to rewrite, not a finished script */
const device = (p: string) => (/framed/i.test(p) ? 'none' : /ipad/i.test(p) ? 'ipad' : /mac/i.test(p) ? 'mac' : /iphone|ios/i.test(p) ? 'iphone' : brand.kind.includes('apple') ? 'iphone' : 'browser');
const beats: any[] = [{ type: 'title', seconds: 2.4, text: brand.name, sub: 'SUBLINE: write through human-prose' }];
for (const c of copied.slice(0, 3)) beats.push({ type: 'shot', seconds: 3.6, src: c, device: device(c), caption: 'CAPTION: write through human-prose' });
if (brand.iconFile) beats.push({ type: 'icon', seconds: 2, src: brand.iconFile, name: brand.name });
beats.push({ type: 'end', seconds: 3, line: `${brand.name}`, cta: 'CTA: where to get it' });
const storyboard = {
  slug: brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  preset: 'landscape',
  motionBlur: false,
  beats,
};
writeFileSync(join(out, 'src/storyboard.json'), JSON.stringify(storyboard, null, 2) + '\n');

if (install) Bun.spawnSync(['bun', 'install'], { cwd: out, stdout: 'inherit', stderr: 'inherit' });

console.log(`\n${out}
brand: accent ${brand.colors.accent?.hex ?? 'none'}, font ${family?.family ?? 'system'}, ${copied.length} captures, icon ${brand.iconFile ?? 'none'}
notes: ${brand.notes.join('; ') || 'none'}
next: rewrite src/storyboard.json, then bun run stills`);
