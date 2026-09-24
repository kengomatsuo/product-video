import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Video } from '@remotion/media';
import { alpha, theme } from './theme';
import { DUR, EASE, SPRING, STILLNESS_MS, f, mix, nudge, ramp, springAt, waterfall } from './motion';
import type { CursorKey, Device, Tap } from './timing';

const isVideo = (src: string) => /\.(mp4|mov|webm|m4v)$/i.test(src);
const url = (src: string) => (/^https?:/.test(src) ? src : staticFile(src));

/* Two grounds and one accent [product-launch-motion law 8]. Static: idle drift reads as waiting [HF]. */
export const Backdrop: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: theme.background }}>
      <AbsoluteFill style={{
        background: `radial-gradient(60% 55% at 50% 12%, ${alpha(theme.accent, 0.2)}, transparent 70%),
                     radial-gradient(45% 40% at 88% 96%, ${alpha(theme.accent, 0.1)}, transparent 70%)`,
      }} />
      {/* fixed grain: stops 8-bit banding in the gradient, never animates */}
      <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: 'overlay', backgroundSize: `${Math.max(width, height) / 6}px`,
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='3'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")` }} />
    </AbsoluteFill>
  );
};

/* Waterfall entry: words whip up from below, binary opacity, accelerating cascade */
export const Words: React.FC<{ text: string; size: number; delay?: number; weight?: number; color?: string; align?: 'center' | 'left' }> = ({ text, size, delay = 0, weight = 700, color = theme.foreground, align = 'center' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = size / 90; // lifts are authored for ~90 px type
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: align === 'left' ? 'flex-start' : 'center', gap: `0 ${size * 0.26}px`, fontSize: size, fontWeight: weight,
      letterSpacing: size > 60 ? '-0.03em' : '-0.01em', lineHeight: 1.05, color, fontFamily: theme.font, textAlign: align }}>
      {waterfall(text.split(' '), fps, delay).map((w, i) => {
        const on = frame >= w.start;
        const t = ramp(frame, w.start, w.start + w.dur, EASE.power4Out);
        return <span key={i} style={{ display: 'inline-block', opacity: on ? 1 : 0, transform: `translateY(${(1 - t) * w.lift * scale}px)` }}>{w.word}</span>;
      })}
    </div>
  );
};

/* Secondary line: arrives after the headline settles, quieter */
const Sub: React.FC<{ text: string; size: number; delay: number; align?: 'center' | 'left' }> = ({ text, size, delay, align = 'center' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = ramp(frame, delay, delay + f(DUR.moderate, fps), EASE.enter);
  return <div style={{ opacity: t, transform: `translateY(${mix(t, size * 0.5, 0)}px)`, fontFamily: theme.font, fontSize: size, fontWeight: 500,
    color: alpha(theme.foreground, 0.62), textAlign: align }}>{text}</div>;
};

export const TitleBeat: React.FC<{ text: string; sub?: string }> = ({ text, sub }) => {
  const { width, height, fps } = useVideoConfig();
  const base = Math.min(width, height);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: base * 0.08, gap: base * 0.035 }}>
      <Words text={text} size={base * 0.085} delay={f(120, fps)} />
      {sub && <Sub text={sub} size={base * (height > width ? 0.045 : 0.032)} delay={f(120 + 420, fps)} />}
    </AbsoluteFill>
  );
};

/* Device frames drawn in CSS; the capture's own aspect always wins, so the UI is never cropped */
const FRAMES: Record<Exclude<Device, 'none'>, { aspect: number; radius: number; bezel: number }> = {
  iphone: { aspect: 1320 / 2868, radius: 0.105, bezel: 0.034 },
  ipad: { aspect: 2064 / 2752, radius: 0.04, bezel: 0.03 },
  mac: { aspect: 16 / 10, radius: 0.008, bezel: 0 },
  browser: { aspect: 16 / 10, radius: 0.008, bezel: 0 },
};

export const Screen: React.FC<{ src: string; trimBefore?: number; fit?: 'fill' | 'contain' }> = ({ src, trimBefore, fit = 'fill' }) => {
  const style: React.CSSProperties = { width: '100%', height: '100%', display: 'block' };
  return isVideo(src)
    ? <Video src={url(src)} muted objectFit={fit} trimBefore={trimBefore} style={style} />
    : <Img src={url(src)} style={{ ...style, objectFit: fit }} />;
};

export const DeviceFrame: React.FC<{ device: Device; height: number; aspect?: number; children: React.ReactNode }> = ({ device, height, aspect, children }) => {
  if (device === 'none') {
    const a = aspect ?? 1;
    return <div style={{ height, width: height * a, position: 'relative', borderRadius: height * 0.012, overflow: 'hidden', boxShadow: `0 ${height * 0.03}px ${height * 0.08}px ${alpha('#000', 0.18)}` }}>{children}</div>;
  }
  const fr = FRAMES[device];
  const h = height, w = h * (aspect ?? fr.aspect);
  const chrome = device === 'mac' || device === 'browser' ? h * 0.045 : 0;
  const bezel = Math.min(w, h) * fr.bezel, radius = Math.min(w, h) * fr.radius;
  return (
    <div style={{ width: w + bezel * 2, height: h + bezel * 2 + chrome, borderRadius: radius + bezel, background: device === 'iphone' || device === 'ipad' ? '#0E0E10' : alpha(theme.foreground, 0.08),
      padding: bezel, boxShadow: `0 ${h * 0.03}px ${h * 0.09}px ${alpha('#000', 0.2)}, 0 0 0 1px ${alpha('#fff', 0.08)} inset`, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {chrome > 0 && (
        <div style={{ height: chrome, display: 'flex', alignItems: 'center', gap: chrome * 0.22, padding: `0 ${chrome * 0.45}px`, background: alpha(theme.background, 0.9) }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} style={{ width: chrome * 0.26, height: chrome * 0.26, borderRadius: '50%', background: c }} />)}
          {device === 'browser' && <span style={{ flex: 1, height: chrome * 0.52, marginLeft: chrome * 0.4, borderRadius: chrome, background: alpha(theme.foreground, 0.07) }} />}
        </div>
      )}
      <div style={{ width: w, height: h, borderRadius: chrome ? `0 0 ${radius}px ${radius}px` : radius, overflow: 'hidden', position: 'relative', background: '#000' }}>{children}</div>
    </div>
  );
};

/* A finger press on iOS: dot presses 1:2 (compress fast, release slow) [HF], ring expands and fades */
export const TapMark: React.FC<{ tap: Tap }> = ({ tap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = Math.round(tap.at * fps), down = f(100, fps), up = f(220, fps);
  if (frame < at - down || frame > at + f(600, fps)) return null;
  const press = frame < at ? ramp(frame, at - down, at, EASE.power2In) : 1 - ramp(frame, at, at + up, EASE.power2Out);
  const ring = ramp(frame, at, at + f(500, fps), EASE.power2Out);
  return (
    <div style={{ position: 'absolute', left: `${tap.x * 100}%`, top: `${tap.y * 100}%`, width: 0, height: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', width: 96, height: 96, left: -48, top: -48, borderRadius: '50%', border: `4px solid ${alpha('#fff', 0.85 * (1 - ring))}`, transform: `scale(${mix(ring, 0.5, 1.5)})` }} />
      <div style={{ position: 'absolute', width: 58, height: 58, left: -29, top: -29, borderRadius: '50%', background: alpha('#fff', 0.6 * (1 - ring * 0.8)),
        boxShadow: `0 0 0 2px ${alpha('#000', 0.12)}`, transform: `scale(${mix(press, 1, 0.84)})` }} />
    </div>
  );
};

/*
 * Oversized cursor [HF oversized-cursor]: enters from below the frame on one decelerating
 * glide (power3.out), tip lands on target, click compresses 0.84 in 0.1 s then releases in
 * 0.22 s, and leaves physically (power2.in). Sized ~7% of frame width: life-size vanishes.
 */
export const Cursor: React.FC<{ keys: CursorKey[]; width: number }> = ({ keys, width }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!keys.length) return null;
  const pts = [{ at: keys[0].at - 0.85, x: keys[0].x, y: 1.2, click: false }, ...keys, { at: keys[keys.length - 1].at + 0.9, x: 1.18, y: keys[keys.length - 1].y, click: false }];
  const t = frame / fps;
  let i = pts.findIndex((p, k) => k < pts.length - 1 && t >= p.at && t < pts[k + 1].at);
  if (t < pts[0].at || i < 0) return null;
  const a = pts[i], b = pts[i + 1];
  const leaving = i === pts.length - 2;
  const span = Math.min(b.at - a.at, leaving ? 0.6 : 0.85);
  const p = ramp(t, a.at, a.at + span, leaving ? EASE.power2In : EASE.power3Out);
  const x = mix(p, a.x, b.x), y = mix(p, a.y, b.y);
  const click = keys.find((k) => k.click && Math.abs(t - k.at) < 0.4);
  let s = 1;
  if (click) { const d = t - click.at; s = d < 0 ? mix(ramp(d, -0.1, 0, EASE.power2In), 1, 0.84) : mix(ramp(d, 0, 0.22, EASE.power2Out), 0.84, 1); }
  const size = width * 0.07;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, marginLeft: -size * 0.21, marginTop: -size * 0.14,
      transform: `scale(${s})`, transformOrigin: '21% 14%', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.3))', overflow: 'visible', zIndex: 20 }}>
      <path d="M5 3 L5 19.5 L9.3 15.6 L12.2 22 L15 20.8 L12.2 14.6 L18 14.6 Z" fill="#1c1c1c" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  );
};

type ShotProps = { src: string; device: Device; aspect?: number; caption?: string; sub?: string;
  zoom?: { to: number; x: number; y: number; at?: number }; taps?: Tap[]; cursor?: CursorKey[]; trimBefore?: number };

/* App Store previews may show only the app [Apple]. Text over live UI collides with the
   status bar and titles (first Cutling test), so the caption gets its own band and the
   whole capture sits under it, uncropped. */
const AppStoreShot: React.FC<ShotProps> = (p) => {
  const { width, height, fps } = useVideoConfig();
  const band = p.caption ? height * 0.15 : 0;
  const boxH = height - band, a = p.aspect ?? width / height;
  const h = Math.min(boxH, width / a), w = h * a;
  return (
    <AbsoluteFill style={{ background: theme.background }}>
      {p.caption && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: band, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: `0 ${width * 0.07}px` }}>
          <Words text={p.caption} size={width * 0.075} delay={f(150, fps)} />
        </div>
      )}
      <div style={{ position: 'absolute', top: band + (boxH - h) / 2, left: (width - w) / 2, width: w, height: h, overflow: 'hidden', borderRadius: p.caption ? w * 0.04 : 0 }}>
        <Screen src={p.src} trimBefore={p.trimBefore} />
        {p.taps?.map((t, i) => <TapMark key={i} tap={t} />)}
      </div>
    </AbsoluteFill>
  );
};

export const ShotBeat: React.FC<ShotProps & { appStore?: boolean }> = (p) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  if (p.appStore) return <AppStoreShot {...p} />;
  const tall = height > width;
  /* the device is composed on arrival: the boundary carries the motion, the beat does not re-enter [HF sign rule] */
  const settle = springAt(frame, fps, 0, SPRING.heavy);
  /* camera with intent: hold, then one slow-fast-slow push onto the subject, then hold */
  const pushAt = f((p.zoom?.at ?? 1.3) * 1000, fps);
  const push = p.zoom ? mix(nudge(frame, pushAt, f(1100, fps)), 1, p.zoom.to) : 1;
  const wide = p.device === 'mac' || p.device === 'browser' || (p.aspect ?? 0) > 1;
  let deviceH = tall ? height * (p.caption ? 0.62 : 0.78) : height * (wide ? 0.62 : 0.8);
  const maxW = tall ? width * 0.9 : width * (p.caption ? 0.58 : 0.86);
  if (p.aspect && deviceH * p.aspect > maxW) deviceH = maxW / p.aspect;
  const content = (
    <div style={{ transform: `translateY(${mix(settle, height * 0.02, 0)}px) scale(${push})`, transformOrigin: p.zoom ? `${p.zoom.x * 100}% ${p.zoom.y * 100}%` : 'center', position: 'relative' }}>
      <DeviceFrame device={p.device} height={deviceH} aspect={p.aspect}>
        <Screen src={p.src} trimBefore={p.trimBefore} />
        {p.taps?.map((t, i) => <TapMark key={i} tap={t} />)}
        {p.cursor && <Cursor keys={p.cursor} width={deviceH * (p.aspect ?? 1.6)} />}
      </DeviceFrame>
    </div>
  );
  const base = Math.min(width, height);
  const caption = p.caption && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: base * 0.018, alignItems: tall ? 'center' : 'flex-start', maxWidth: tall ? width * 0.86 : width * 0.32 }}>
      <Words text={p.caption} size={base * (tall ? 0.068 : 0.056)} delay={f(200, fps)} align={tall ? 'center' : 'left'} />
      {p.sub && <Sub text={p.sub} size={base * 0.03} delay={f(200 + 450, fps)} align={tall ? 'center' : 'left'} />}
    </div>
  );
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: tall ? 'column' : 'row', gap: tall ? height * 0.03 : width * 0.05 }}>
      {tall ? <>{caption}{content}</> : <>{content}{caption}</>}
    </AbsoluteFill>
  );
};

export const IconBeat: React.FC<{ src: string; name?: string }> = ({ src, name }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const size = Math.min(width, height) * 0.26;
  const pop = springAt(frame, fps, f(80, fps), SPRING.pop);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: size * 0.2, flexDirection: 'column' }}>
      <Img src={url(src)} style={{ width: size, height: size, borderRadius: size * 0.2237, transform: `scale(${pop})`, boxShadow: `0 ${size * 0.08}px ${size * 0.25}px ${alpha('#000', 0.2)}` }} />
      {name && <Words text={name} size={size * 0.28} delay={f(380, fps)} />}
    </AbsoluteFill>
  );
};

/* Icon lands, a held beat of stillness, then the call to action [HF stillness before climax] */
export const EndBeat: React.FC<{ line: string; cta?: string; icon?: string }> = ({ line, cta, icon }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const base = Math.min(width, height);
  const iconIn = springAt(frame, fps, f(60, fps), SPRING.pop);
  const lineAt = f(260, fps);
  const ctaAt = lineAt + f(500 + STILLNESS_MS, fps);
  const ctaIn = springAt(frame, fps, ctaAt, SPRING.pop);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: base * 0.045 }}>
      {icon && <Img src={url(icon)} style={{ width: base * 0.16, height: base * 0.16, borderRadius: base * 0.16 * 0.2237, transform: `scale(${iconIn})`, boxShadow: `0 ${base * 0.012}px ${base * 0.04}px ${alpha('#000', 0.2)}` }} />}
      <Words text={line} size={base * 0.07} delay={lineAt} />
      {cta && <div style={{ transform: `scale(${mix(ctaIn, 0.86, 1)})`, opacity: frame >= ctaAt ? 1 : 0, padding: `${base * 0.018}px ${base * 0.045}px`, borderRadius: 999, background: theme.accent,
        color: '#fff', fontFamily: theme.font, fontWeight: 650, fontSize: base * 0.034, letterSpacing: '-0.01em' }}>{cta}</div>}
    </AbsoluteFill>
  );
};
