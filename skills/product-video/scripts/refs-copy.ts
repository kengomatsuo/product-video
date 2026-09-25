#!/usr/bin/env bun
/*
 * The on-screen copy of every reference image, as study material for captions.
 *   bun refs-copy.ts <refs-dir> [--tiers tiers.json]  -> <refs>/copy/lines.json + summary
 * OCR by macOS Vision (refs-ocr.swift). Big type is headline copy. A line matching an LLM
 * tell is flagged: it is never an example. tiers.json maps a filename prefix to a trust
 * tier (A in-house writers, B established store listings, C mixed, D placeholder).
 */
import { mkdirSync, readdirSync, statSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const [refsArg, ...rest] = process.argv.slice(2);
if (!refsArg) { console.error('usage: bun refs-copy.ts <refs-dir> [--tiers tiers.json]'); process.exit(2); }
const refs = resolve(refsArg);
const ti = rest.indexOf('--tiers');
const tiers: Record<string, string> = ti >= 0 ? JSON.parse(readFileSync(rest[ti + 1], 'utf8')) : {};

const images: string[] = [];
const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) { if (!/skills|audio|node_modules/.test(f)) walk(p); } else if (/\.(png|jpe?g|webp)$/i.test(f)) images.push(p); } };
walk(refs);

const bin = join(import.meta.dir, '.refs-ocr');
if (!existsSync(bin)) Bun.spawnSync(['swiftc', '-O', join(import.meta.dir, 'refs-ocr.swift'), '-o', bin], { stdout: 'inherit', stderr: 'inherit' });

const TELLS = /\b(seamless(ly)?|effortless(ly)?|unlock|elevate|supercharge|reimagine|revolutioni[sz]e|empower|streamline|all-in-one|at your fingertips|game[- ]changer|next[- ]level)\b|\bnot just\b.*\bbut\b|^no \w+\. no \w+/i;
const rows: { src: string; tier: string; size: number; text: string; words: number; tell: boolean }[] = [];
for (let i = 0; i < images.length; i += 40) {
  const out = Bun.spawnSync([bin, ...images.slice(i, i + 40)]).stdout.toString();
  for (const line of out.split('\n').filter(Boolean)) {
    const [file, size, , text] = line.split('\t');
    const src = relative(refs, file), name = src.split('/').pop()!;
    const tier = Object.entries(tiers).find(([k]) => name.startsWith(k))?.[1] ?? '?';
    rows.push({ src, tier, size: Number(size), text, words: text.split(/\s+/).length, tell: TELLS.test(text) || /,.*,.*\band\b/i.test(text) });
  }
}
mkdirSync(join(refs, 'copy'), { recursive: true });
writeFileSync(join(refs, 'copy/lines.json'), JSON.stringify(rows, null, 1));

const heads = rows.filter((r) => r.size >= 0.04 && !r.tell && ['A', 'B'].includes(r.tier)).map((r) => r.words).sort((a, b) => a - b);
const q = (p: number) => heads[Math.floor(p * (heads.length - 1))];
console.log(`${images.length} images, ${rows.length} lines, ${rows.filter((r) => r.tell).length} flagged`);
if (heads.length) console.log(`trusted headlines: n=${heads.length}, words median ${q(0.5)}, p25 ${q(0.25)}, p75 ${q(0.75)}`);
