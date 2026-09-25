import { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';
import * as brush from 'p5.brush/standalone';

/*
 * Watercolour plates painted ONCE with p5.brush (MIT, standalone build, WebGL2), then
 * reused as images every frame. Same seed in every render tab, so every tab paints the
 * same picture. Painting per frame would flicker and crawl.
 */
export type Brush = typeof brush;
export type PaintJob = { name: string; w: number; h: number; seed: number; paper?: string; draw: (b: Brush, w: number, h: number) => void };

const cache = new Map<string, Promise<string>>();
let queue: Promise<unknown> = Promise.resolve(); // one WebGL target at a time
let gl: HTMLCanvasElement | undefined;

function paint(job: PaintJob): Promise<string> {
  const key = `${job.name}:${job.w}x${job.h}:${job.seed}`;
  if (!cache.has(key)) {
    const p = queue.then(() => {
      /* one WebGL2 canvas for every plate: a second context fails in headless Chrome */
      gl ??= document.createElement('canvas');
      gl.width = job.w; gl.height = job.h;
      const canvas = gl;
      brush.load(canvas);
      brush.seed(job.seed);
      brush.noiseSeed(job.seed);
      brush.scaleBrushes(Math.max(job.w, job.h) / 600);
      brush.clear(job.paper ?? '#FBF7F0');
      /* the WebGL origin is the centre; jobs draw in top-left coordinates */
      brush.push();
      brush.translate(-job.w / 2, -job.h / 2);
      job.draw(brush, job.w, job.h);
      brush.pop();
      brush.render();
      /* copy out before the next plate reuses the WebGL canvas */
      const out = document.createElement('canvas');
      out.width = job.w; out.height = job.h;
      out.getContext('2d')!.drawImage(canvas, 0, 0);
      return new Promise<string>((res) => out.toBlob((b) => res(URL.createObjectURL(b!)), 'image/png'));
    });
    queue = p;
    cache.set(key, p);
  }
  return cache.get(key)!;
}

/* the painted plate's URL; holds the render until it exists */
export function usePainted(job: PaintJob) {
  const [url, setUrl] = useState<string | null>(null);
  const [handle] = useState(() => delayRender(`paint ${job.name}`, { timeoutInMilliseconds: 120_000 }));
  useEffect(() => {
    paint(job).then((u) => { setUrl(u); continueRender(handle); });
  }, [job.name, job.seed, job.w, job.h]);
  return url;
}

/* helpers for organic shapes */
export const blobPts = (cx: number, cy: number, rx: number, ry: number, rnd: () => number, n = 28) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2, k = 0.82 + rnd() * 0.3;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k] as [number, number];
  });

