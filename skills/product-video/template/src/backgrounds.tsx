import React, { useEffect, useRef } from 'react';
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from 'remotion';
import { blobPts, usePainted, type PaintJob } from './paint';

/*
 * Background styles, each moving slowly behind the subject. Every drift is a pure
 * function of the frame, so any frame renders identically.
 */
export type BackgroundStyle = 'mesh' | 'watercolor' | 'shapes' | 'solid';
export type Palette = { base: string; tints: string[]; accent: string };

/* per-frame noise at 2.5% breaks 8-bit steps in the gradients before the encoder sees them */
export const Dither: React.FC<{ opacity?: number }> = ({ opacity = 0.025 }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, ctx = c.getContext('2d')!;
    const img = ctx.createImageData(c.width, c.height);
    let s = (frame + 1) * 2654435761 >>> 0;
    for (let i = 0; i < img.data.length; i += 4) {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      const v = (s >>> 0) & 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [frame]);
  return <canvas ref={ref} width={480} height={270} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, mixBlendMode: 'overlay', imageRendering: 'pixelated' }} />;
};

/* soft colour fields on independent orbits (periods 7-12 s, a quarter of the frame wide),
   each also breathing in size, so the light visibly travels during any 3 seconds */
const Mesh: React.FC<{ p: Palette; speed: number }> = ({ p, speed }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = (frame / fps) * speed;
  const fields = [
    { c: p.tints[0], r: 0.6, x: 0.25, y: 0.25, ax: 0.22, ay: 0.18, px: 9, py: 11 },
    { c: p.tints[1], r: 0.55, x: 0.78, y: 0.75, ax: 0.2, ay: 0.2, px: 11, py: 8 },
    { c: p.tints[2] ?? p.tints[0], r: 0.42, x: 0.7, y: 0.2, ax: 0.25, ay: 0.14, px: 12, py: 9.5 },
    { c: p.accent, r: 0.34, x: 0.3, y: 0.82, ax: 0.24, ay: 0.12, px: 7.5, py: 10 },
  ];
  const d = Math.max(width, height);
  return (
    <AbsoluteFill style={{ background: p.base, overflow: 'hidden' }}>
      {fields.map((f, i) => {
        const x = (f.x + f.ax * Math.sin((2 * Math.PI * t) / f.px + i * 1.3)) * width;
        const y = (f.y + f.ay * Math.cos((2 * Math.PI * t) / f.py + i * 1.7)) * height;
        const r = f.r * d * (1 + 0.15 * Math.sin((2 * Math.PI * t) / (f.px * 0.8) + i));
        return <div key={i} style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%',
          background: `radial-gradient(closest-side, ${f.c}, transparent)`, opacity: i === 3 ? 0.42 : 0.95, filter: `blur(${d * 0.02}px)` }} />;
      })}
    </AbsoluteFill>
  );
};

/* painted plates, far and near, drifting at different speeds (parallax) */
const Watercolor: React.FC<{ p: Palette; speed: number }> = ({ p, speed }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const W = Math.round(width * 1.25), H = Math.round(height * 1.3);
  const far: PaintJob = { name: `wc-far-${p.base}`, w: W, h: H, seed: 11, paper: p.base, draw: (b, w, h) => {
    b.noStroke();
    const spots: [number, number, number, number, number][] = [[0.18, 0.2, 0.34, 0.3, 0], [0.82, 0.78, 0.4, 0.34, 1], [0.7, 0.15, 0.22, 0.18, 2], [0.25, 0.85, 0.26, 0.2, 1]];
    for (const [x, y, rx, ry, k] of spots) {
      b.fill(p.tints[k] ?? p.tints[0], 140); b.fillBleed(0.25, 'out'); b.fillTexture(0.55, 0.4);
      b.polygon(blobPts(x * w, y * h, rx * w, ry * h, () => b.random()));
    }
  } };
  const near: PaintJob = { name: `wc-near-${p.accent}`, w: W, h: H, seed: 23, paper: '#FFFFFF', draw: (b, w, h) => {
    b.noStroke();
    for (let i = 0; i < 7; i++) {
      b.fill(i % 2 ? p.accent : p.tints[i % p.tints.length], 60 + b.random() * 50); b.fillBleed(0.3, 'out'); b.fillTexture(0.6, 0.35);
      b.circle(b.random() * w, b.random() * h, (0.04 + b.random() * 0.07) * w, 0.6);
    }
  } };
  const a = usePainted(far), n = usePainted(near);
  const t = (frame / fps) * speed;
  if (!a || !n) return null;
  const plate = (src: string, px: number, py: number, blend?: React.CSSProperties['mixBlendMode']) => (
    <Img src={src} style={{ position: 'absolute', width: W, height: H, left: (width - W) / 2 + Math.sin(t / px) * width * 0.04, top: (height - H) / 2 + Math.cos(t / py) * height * 0.04, mixBlendMode: blend }} />
  );
  return <AbsoluteFill style={{ background: p.base, overflow: 'hidden' }}>{plate(a, 5.3, 7.1)}{plate(n, 3.1, 4.3, 'multiply')}</AbsoluteFill>;
};

/* floating soft geometry: triangles, rings, pills, each on its own depth and drift */
const Shapes: React.FC<{ p: Palette; speed: number }> = ({ p, speed }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = (frame / fps) * speed;
  const items = Array.from({ length: 14 }, (_, i) => {
    const rnd = (k: number) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
    const depth = 0.4 + rnd(1) * 0.6, size = (0.03 + rnd(2) * 0.07) * width * depth;
    return { kind: i % 3, x: rnd(3), y: rnd(4), depth, size, rot: rnd(5) * 360, spin: (rnd(6) - 0.5) * 8, color: i % 4 === 0 ? p.accent : p.tints[i % p.tints.length] };
  });
  return (
    <AbsoluteFill style={{ background: p.base, overflow: 'hidden' }}>
      {items.map((s, i) => {
        const x = ((s.x + t * 0.006 * s.depth) % 1.2) * width - width * 0.1;
        const y = s.y * height + Math.sin(t / (3 + s.depth * 4) + i) * height * 0.02;
        const common: React.CSSProperties = { position: 'absolute', left: x, top: y, width: s.size, height: s.size, transform: `rotate(${s.rot + t * s.spin}deg)`, opacity: 0.25 + s.depth * 0.45, filter: `blur(${(1 - s.depth) * 6}px)` };
        if (s.kind === 0) return <div key={i} style={{ ...common, background: s.color, clipPath: 'polygon(50% 6%, 96% 90%, 4% 90%)', borderRadius: s.size * 0.1 }} />;
        if (s.kind === 1) return <div key={i} style={{ ...common, border: `${s.size * 0.12}px solid ${s.color}`, borderRadius: '50%' }} />;
        return <div key={i} style={{ ...common, height: s.size * 0.42, background: s.color, borderRadius: s.size }} />;
      })}
    </AbsoluteFill>
  );
};

export const Background: React.FC<{ style: BackgroundStyle; palette: Palette; speed?: number; dither?: boolean }> = ({ style, palette, speed = 1, dither = true }) => (
  <AbsoluteFill>
    {style === 'mesh' && <Mesh p={palette} speed={speed} />}
    {style === 'watercolor' && <Watercolor p={palette} speed={speed} />}
    {style === 'shapes' && <Shapes p={palette} speed={speed} />}
    {style === 'solid' && <AbsoluteFill style={{ background: palette.accent }} />}
    {dither && <Dither />}
  </AbsoluteFill>
);
