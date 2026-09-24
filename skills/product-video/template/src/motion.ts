import { Easing, interpolate, spring, type EasingFunction } from 'remotion';

/*
 * The motion system. Every number cites where it came from; references/motion.md
 * carries the full reasoning. Sources:
 *   [M3]  m3.material.io easing and duration tokens
 *   [CB]  IBM Carbon motion tokens (packages/motion/src/dtcg/motion.json)
 *   [FL]  Microsoft Fluent 2 tokens (packages/tokens/src/global)
 *   [AP]  Apple SwiftUI Spring docs + WWDC23 "Animate with springs"
 *   [HF]  heygen-com/hyperframes skills: motion-doctrine, cut-the-curve, oversized-cursor (Apache-2.0)
 *   [AE]  After Effects help: Easy Ease = speed 0, influence 33.33%
 */

/* durations in ms; frames at any fps via f() */
export const DUR = {
  instant: 70,   // [CB] fast.01, micro-interactions
  fast: 150,     // [CB] moderate.01, [FL] durationFast
  base: 200,     // [M3] short4, [FL] durationNormal
  moderate: 300, // [M3] medium2, [FL] durationSlow
  slow: 400,     // [CB] slow.01
  emphasis: 500, // [M3] long2, card to full screen
  hero: 700,     // [CB] slow.02, large hero transitions
  entryMax: 800, // [HF] a single entry never exceeds ~800 ms
};
export const f = (ms: number, fps: number) => Math.max(1, Math.round((ms / 1000) * fps));

/* named curves */
export const EASE = {
  standard: Easing.bezier(0.2, 0, 0, 1),           // [M3] standard
  enter: Easing.bezier(0.05, 0.7, 0.1, 1),          // [M3] emphasized decelerate: things arriving
  exit: Easing.bezier(0.3, 0, 0.8, 0.15),           // [M3] emphasized accelerate: things leaving
  easyEase: Easing.bezier(0.33, 0, 0.67, 1),        // [FL] curveEasyEase ~ [AE] Easy Ease
  camera: Easing.bezier(0.65, 0, 0.35, 1),          // ease-in-out for camera moves (convention, no single spec)
  linear: Easing.linear,
  /* GSAP-named power curves [HF] expresses its rules in; powerN = polynomial of degree N+1 */
  power2In: Easing.in(Easing.cubic), power2Out: Easing.out(Easing.cubic),
  power3In: Easing.in(Easing.poly(4)), power3Out: Easing.out(Easing.poly(4)),
  power4In: Easing.in(Easing.poly(5)), power4Out: Easing.out(Easing.poly(5)),
  expoOut: Easing.out(Easing.exp),
} satisfies Record<string, EasingFunction>;

/* springs. Remotion's default {1,100,10} is Apple's default too, which [AP] resolves
   to bounce 0.5: above WWDC's "avoid > 0.4 for UI". Never use it bare. */
export const SPRING = {
  smooth: { mass: 1, stiffness: 120, damping: 200 },       // no overshoot: text, UI settling
  pop: { mass: 1, stiffness: 157.9, damping: 17.6 },        // [AP] Spring(duration 0.5, bounce 0.3), the ceiling for UI
  heavy: { mass: 1.4, stiffness: 90, damping: 30 },          // big surfaces: devices, windows; mass reacts slower [HF]
};
export const springAt = (frame: number, fps: number, delay: number, config = SPRING.smooth) =>
  spring({ frame: frame - delay, fps, config });

/* 0..1 over [a, b] frames, clamped */
export const ramp = (frame: number, a: number, b: number, ease: EasingFunction = EASE.standard) =>
  interpolate(frame, [a, b], [0, 1], { easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
export const mix = (t: number, from: number, to: number) => from + (to - from) * t;

/*
 * Cut the curve [HF]: the default boundary between beats. The outgoing beat accelerates
 * ~12% of the frame in the film's one direction (power4.in), the cut lands mid-motion,
 * the incoming beat continues the same way and decelerates (power4.out): the two halves
 * of one power4.inOut, so speed matches at the cut. Exit fade ends at ~30% of its travel;
 * entry ignites at 0.35 opacity. Zero overlap: one side on screen per frame.
 */
export const CUT = { travel: 0.12, exitMs: 320, entryMs: 380, fadeMs: 200, igniteOpacity: 0.35 };

export function cutExit(frame: number, len: number, fps: number, width: number) {
  const e = f(CUT.exitMs, fps), start = len - e;
  const t = ramp(frame, start, len, EASE.power4In);
  const fade = ramp(frame, start, start + f(CUT.fadeMs, fps), EASE.linear);
  return { x: -t * width * CUT.travel, opacity: 1 - fade };
}
export function cutEntry(frame: number, fps: number, width: number) {
  const t = ramp(frame, 0, f(CUT.entryMs, fps), EASE.power4Out);
  return { x: (1 - t) * width * CUT.travel, opacity: mix(t, CUT.igniteOpacity, 1) };
}

/* Apple's App Store preview guidance asks for dissolves and fades: 10 frames at 30 fps */
export const DISSOLVE_MS = 330;

/*
 * Waterfall entry [HF] §6: words arrive from below, each starting before the previous
 * settles; opacity is binary (a fade fights the snap); anchors travel further and slower,
 * light words snap; gaps shrink x0.84 so the wave accelerates and resolves.
 */
export function waterfall(words: string[], fps: number, delay = 0) {
  const light = /^(a|an|the|of|to|in|on|and|or|for|with|at|by|—|-|&)$/i;
  let at = delay, gap = f(50, fps);
  return words.map((w, i) => {
    const anchor = i === 0 || w.length >= 7;
    const kind = light.test(w) ? 'light' : anchor ? 'anchor' : 'normal';
    const dur = f(kind === 'anchor' ? 180 : kind === 'normal' ? 145 : 115, fps);
    const lift = kind === 'anchor' ? 70 : kind === 'normal' ? 45 : 36;
    const item = { word: w, start: Math.round(at), dur, lift };
    at += Math.max(1, gap);
    gap *= 0.84;
    return item;
  });
}

/*
 * Nudge curve [HF] §7: slow-fast-slow for a camera push or group slide. Ramp 10% of the
 * distance in 20% of the time, burst 65% linear in 18%, tail 25% in 62% with power4.out.
 */
export function nudge(frame: number, start: number, frames: number) {
  const a = start + frames * 0.2, b = a + frames * 0.18, end = start + frames;
  if (frame <= start) return 0;
  if (frame < a) return 0.1 * EASE.power3In((frame - start) / (a - start));
  if (frame < b) return 0.1 + 0.65 * ((frame - a) / (b - a));
  if (frame < end) return 0.75 + 0.25 * EASE.power4Out((frame - b) / (end - b));
  return 1;
}

/* stillness before climax [HF]: 0.3-0.75 s between an action and its result */
export const STILLNESS_MS = 450;
