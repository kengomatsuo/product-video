#!/usr/bin/env bun
/**
 * Read a project's own brand from its files: colour tokens, fonts, icon, logo,
 * existing screenshots and demo clips. Prints brand.json; never invents a value.
 *
 *   bun detect-brand.ts <project-dir> [--out brand.json]
 *
 * Sources, in the order a value is trusted:
 *   Swift  : *.xcassets/AccentColor.colorset, AppIcon-* images, AppIcon.icon packages
 *   Web    : CSS custom properties (:root first), Tailwind v4 @theme, @font-face, @fontsource deps
 *   Assets : files named logo/wordmark, screenshot folders (fastlane, .shots), demo videos
 */
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, basename, extname, resolve, dirname } from 'node:path';

let ROOT = '.';

const SKIP = new Set(['node_modules', '.git', 'dist', 'build', 'DerivedData', '.next', '.astro',
  '.turbo', 'coverage', 'Pods', '.build', 'test_output.xcresult', 'crashlogs', '.wrangler']);
const MAX_FILES = 40_000;

type Colour = { hex: string; source: string; name?: string; dark?: string };
type Brand = {
  name: string;
  root: string;
  kind: string[];
  colors: { accent?: Colour; background?: Colour; foreground?: Colour; extra: Colour[] };
  fonts: { family: string; files: string[]; source: string }[];
  icon?: string;
  logos: string[];
  screenshots: string[];
  clips: string[];
  notes: string[];
};

/* vendored or borrowed code carries other people's brands */
const FOREIGN = /(^|\/)(research|fixtures?|examples?|tests?|__tests__|vendor|third[_-]party|worktrees|\.claude|\.agents)\//i;

/* git's own list respects .gitignore; fall back to a walk outside git */
function listFiles(root: string): string[] {
  const git = Bun.spawnSync(['git', 'ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root });
  if (git.exitCode !== 0) return walk(root);
  const files = git.stdout.toString().split('\n').filter(Boolean);
  const dirs = new Set<string>();
  for (const f of files) {
    const parts = f.split('/');
    for (let i = 1; i < parts.length; i++) dirs.add(parts.slice(0, i).join('/') + '/');
  }
  return [...files, ...dirs].map((f) => join(root, f)).filter((f) => !FOREIGN.test(relative(root, f)) && ![...SKIP].some((s) => f.includes('/' + s + '/')));
}

function walk(dir: string, out: string[] = []): string[] {
  if (out.length > MAX_FILES) return out;
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e) || FOREIGN.test(e + '/')) continue;
    const p = join(dir, e);
    let s;
    try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) {
      out.push(p + '/');
      walk(p, out);
    } else out.push(p);
  }
  return out;
}

const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();

/* Xcode stores components as "0.540", "0x8A" or "138" */
function component(v: string): number {
  if (v.startsWith('0x')) return parseInt(v, 16) / 255;
  const n = parseFloat(v);
  return n > 1 ? n / 255 : n;
}

function colorset(file: string): { light?: string; dark?: string } {
  const j = JSON.parse(readFileSync(file, 'utf8'));
  const res: { light?: string; dark?: string } = {};
  for (const c of j.colors ?? []) {
    const k = c.color?.components;
    if (!k) continue;
    const hex = toHex(component(k.red), component(k.green), component(k.blue));
    const dark = (c.appearances ?? []).some((a: any) => a.value === 'dark');
    if (dark) res.dark ??= hex; else res.light ??= hex;
  }
  return res;
}

const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\))$/i;
const ROLE: [keyof Brand['colors'], RegExp][] = [
  ['accent', /(^|-)(accent|primary|brand|tint)(-500|-600)?$/],
  ['background', /(^|-)(bg|background|page|surface|canvas|paper)$/],
  ['foreground', /(^|-)(fg|foreground|ink|text)$/],
];

function cssTokens(file: string, rel: string, brand: Brand) {
  const src = readFileSync(file, 'utf8');
  /* keep light-scheme declarations: cut dark blocks out before matching */
  const light = src.replace(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{[\s\S]*?\}\s*\}/g, '')
    .replace(/(\.dark|\[data-theme=["']?dark["']?\])[^{]*\{[^}]*\}/g, '');
  for (const m of light.matchAll(/--([\w-]+)\s*:\s*([^;}{]+);/g)) {
    const name = m[1].toLowerCase(), value = m[2].trim();
    if (!COLOR_RE.test(value)) continue;
    const colour = { hex: value, source: rel, name: '--' + m[1] };
    const role = ROLE.find(([, re]) => re.test(name.replace(/^color-/, '')));
    if (role && !brand.colors[role[0]]) (brand.colors as any)[role[0]] = colour;
    else if (brand.colors.extra.length < 12 && /accent|primary|brand|secondary|highlight/.test(name))
      brand.colors.extra.push(colour);
  }
  for (const m of src.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
    const fam = m[1].match(/font-family\s*:\s*["']?([^"';]+)/)?.[1]?.trim();
    if (!fam) continue;
    /* url() is relative to the stylesheet; keep only files that exist in the repo */
    const urls = [...m[1].matchAll(/url\(["']?([^"')]+)/g)].map((u) => u[1].split(/[?#]/)[0])
      .map((u) => relative(ROOT, resolve(dirname(file), u))).filter((u) => existsSync(join(ROOT, u)));
    const f = brand.fonts.find((x) => x.family === fam) ?? (brand.fonts.push({ family: fam, files: [], source: rel }), brand.fonts.at(-1)!);
    f.files.push(...urls.filter((u) => !f.files.includes(u)));
  }
  const body = src.match(/(?:body|html|:root)\s*\{[^}]*font-family\s*:\s*([^;]+)/)?.[1];
  if (body) {
    const first = body.split(',')[0].trim().replace(/["']/g, '');
    if (!first.startsWith('var(') && !brand.fonts.some((f) => f.family === first) && !/^(-apple-system|system-ui|sans-serif|inherit)$/.test(first))
      brand.fonts.push({ family: first, files: [], source: rel + ' (font-family)' });
  }
}

function main() {
  const args = process.argv.slice(2);
  const root = resolve(args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--out') ?? '.');
  ROOT = root;
  const outIdx = args.indexOf('--out');
  const files = listFiles(root).filter((f) => existsSync(f));
  const rel = (p: string) => relative(root, p);

  const brand: Brand = { name: basename(root), root, kind: [], colors: { extra: [] }, fonts: [], logos: [], screenshots: [], clips: [], notes: [] };

  /* what kind of project */
  if (files.some((f) => /\.xcodeproj\/$/.test(f))) brand.kind.push('apple');
  const pkgPath = join(root, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    brand.kind.push('web');
    if (pkg.name && !pkg.name.startsWith('@')) brand.name = pkg.name;
  }
  const xcodeproj = files.find((f) => /\.xcodeproj\/$/.test(f));
  if (xcodeproj) brand.name = basename(xcodeproj.slice(0, -1), '.xcodeproj');

  /* Swift accent: the app target's colorset, not a widget or extension */
  const sets = files.filter((f) => f.endsWith('AccentColor.colorset/Contents.json'))
    .sort((a, b) => a.split('/').length - b.split('/').length || (/(widget|extension|action|share|keyboard)/i.test(a) ? 1 : -1));
  for (const s of sets) {
    const c = colorset(s);
    if (c.light && !brand.colors.accent) { brand.colors.accent = { hex: c.light, dark: c.dark, source: rel(s), name: 'AccentColor' }; break; }
  }

  /* CSS tokens: app styles before marketing styles */
  const css = files.filter((f) => /\.(css|scss)$/.test(f) && !/\.shots\//.test(f))
    .sort((a, b) => Number(/web\/|site\/|docs\//.test(a)) - Number(/web\/|site\/|docs\//.test(b)));
  for (const f of css) { try { cssTokens(f, rel(f), brand); } catch {} }

  /* fontsource and google-font deps in any package.json */
  for (const p of files.filter((f) => basename(f) === 'package.json')) {
    try {
      const j = JSON.parse(readFileSync(p, 'utf8'));
      for (const d of Object.keys({ ...j.dependencies, ...j.devDependencies })) {
        const m = d.match(/^@fontsource(?:-variable)?\/(.+)$/);
        if (!m) continue;
        const fam = m[1].split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
        if (!brand.fonts.some((f) => f.family.toLowerCase() === fam.toLowerCase())) brand.fonts.push({ family: fam, files: [], source: rel(p) + ` (${d})` });
      }
    } catch {}
  }
  /* font files shipped in the repo, grouped into the family they belong to */
  for (const f of files.filter((x) => /\.(woff2|ttf|otf)$/i.test(x))) {
    const stem = basename(f).replace(/[-_](\d{3}|var|variable|italic|regular|bold|medium|semibold|ext|latin).*$/i, '').replace(extname(f), '');
    const known = brand.fonts.find((x) => x.family.replace(/\s/g, '').toLowerCase() === stem.replace(/[\s-]/g, '').toLowerCase());
    if (known) { if (known.files.length < 8 && !known.files.includes(rel(f))) known.files.push(rel(f)); }
    else if (brand.fonts.length < 6) brand.fonts.push({ family: stem, files: [rel(f)], source: rel(f) + ' (file)' });
  }

  /* icon: the biggest app-icon image, else a web icon */
  const icons = files.filter((f) => /\.(png|svg)$/i.test(f) && /appicon|app-icon|icon\.png$|apple-touch-icon|favicon.*\.(png|svg)$/i.test(f));
  icons.sort((a, b) => (statSync(b).size - statSync(a).size));
  brand.icon = icons[0] && rel(icons[0]);
  const iconPkg = files.find((f) => /AppIcon\.icon\/$/.test(f));
  if (iconPkg) brand.notes.push(`Icon Composer package at ${rel(iconPkg)}: layered SVGs, usable for an animated icon build-up`);

  brand.logos = files.filter((f) => /\.(svg|png)$/i.test(f) && /(logo|wordmark|lockup)/i.test(basename(f))).slice(0, 10).map(rel);
  /* English or unlocalised first, device frames and frame backgrounds out */
  const locale = (p: string) => (/(\/|^)en(-US)?\//.test(p) ? 0 : /\/[a-z]{2}(-[A-Z]{2})?\//.test(p) ? 2 : 1);
  brand.screenshots = files.filter((f) => /\.(png|jpe?g)$/i.test(f) && /(fastlane\/screenshots|\.shots\/captures|screenshots?\/|captures?\/)/i.test(f)
      && !/(background|frame|bezel|template)\.(png|jpe?g)$/i.test(f))
    .map(rel).sort((a, b) => locale(a) - locale(b) || Number(/framed/i.test(a)) - Number(/framed/i.test(b)) || a.localeCompare(b)).slice(0, 40);
  brand.clips = files.filter((f) => /\.(mp4|mov|webm)$/i.test(f)).slice(0, 10).map(rel);

  for (const k of ['accent', 'background', 'foreground'] as const)
    if (!brand.colors[k]) brand.notes.push(`no ${k} colour found: ask, or read it off a screenshot`);
  if (!brand.fonts.length) brand.notes.push('no brand font found: the app likely uses the system font (SF Pro on Apple)');

  const json = JSON.stringify(brand, null, 2);
  if (outIdx >= 0) writeFileSync(args[outIdx + 1], json + '\n');
  console.log(json);
}

main();
