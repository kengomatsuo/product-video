import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Audio, Video } from '@remotion/media';
import { Background, type Palette } from './backgrounds';
import { alpha, theme } from './theme';
import { speechOnsets } from './words';
import plan from './appstore.json';

/*
 * App Store previews: 15-30 s, <= 30 fps, screen captures of the app only, text overlays
 * allowed (developer.apple.com app preview specifications + Guideline 2.3.4).
 * Designed for portrait: a caption band on top, the real recording below in a rounded
 * screen at the capture's own aspect, never cropped, never zoomed, no device frame.
 * iPhone 6.9-inch 886 x 1920; iPad 13-inch 1200 x 1600.
 * The takes, captions and music live in src/appstore.json; examples/cutling shows a full one.
 */
export const FPS = 30;
export const PREVIEW_FRAMES = Math.round(29.5 * FPS);

const palette: Palette = { base: theme.background, tints: [alpha(theme.accent, 0.22), alpha(theme.accent, 0.1), alpha(theme.foreground, 0.05)], accent: alpha(theme.accent, 0.5) };
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const outC = Easing.out(Easing.cubic);
const r = (f: number, a: number, b: number, e = outC) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const s = (sec: number) => Math.round(sec * FPS);
const DISSOLVE = 0.4;

/* a piece of a recording: `at` on the preview timeline, [from, to] seconds in the take.
   `hold` freezes the `from` frame until the next cut. Every action plays at speed; only
   the tool's dead waits are cut, on identical frames. */
type Cut = { src: string; at: number; from: number; to: number; hold?: boolean };
/* [cut index, seconds in that take, x, y as fractions of the screen] */
type Tap = number[];
type Take = { capture: number[]; swap: number; drop: number; cuts: Cut[]; taps: Tap[] };
type Spec = Take & { w: number; h: number; band: number; title: number; sub: number; radius: number };
type Line = { text: string; sub?: string; from: number; to: number };
type Plan = { lines: Line[]; music: { src: string; lift: number; volume?: number } | null; tapSound: string | null; iphone: Take; ipad: Take };
const p = plan as unknown as Plan;

const IPHONE: Spec = { ...p.iphone, w: 886, h: 1920, band: 360, title: 84, sub: 38, radius: 54 };
const IPAD: Spec = { ...p.ipad, w: 1200, h: 1600, band: 330, title: 92, sub: 40, radius: 34 };

const tapTime = (spec: Spec, c: number, sec: number) => spec.cuts[c].at + (sec - spec.cuts[c].from);

const Recording: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const SH = spec.h - spec.band - 40, SW = Math.round(SH * spec.capture[0] / spec.capture[1]);
  const SX = (spec.w - SW) / 2, SY = spec.band;
  /* the incoming take fades in over the outgoing one */
  const xf = r(f, s(spec.swap), s(spec.swap + DISSOLVE), Easing.linear);
  return (
    <div style={{ position: 'absolute', left: SX, top: SY, width: SW, height: SH, borderRadius: spec.radius, overflow: 'hidden',
      boxShadow: `0 30px 80px ${alpha(theme.foreground, 0.18)}, 0 0 0 1px ${alpha(theme.foreground, 0.06)}`, background: alpha(theme.foreground, 0.04) }}>
      {spec.cuts.map((c, i) => {
        const next = spec.cuts[i + 1];
        const overlap = next && next.src !== c.src ? DISSOLVE : 0;
        const end = c.hold ? (next ? next.at : 29.5) + overlap : c.at + (c.to - c.from) + overlap;
        const first = c.src === spec.cuts[0].src;
        return (
          <Sequence key={i} from={s(c.at)} durationInFrames={Math.max(1, s(end - c.at))} layout="none">
            <div style={{ position: 'absolute', inset: 0, opacity: first ? 1 : xf }}>
              <Video src={staticFile(c.src)} trimBefore={s(c.from)} playbackRate={c.hold ? 0.01 : 1} muted style={{ width: '100%', height: '100%', display: 'block' }} />
            </div>
          </Sequence>
        );
      })}
      {spec.taps.map(([c, sec, u, v], i) => {
        const d = t - tapTime(spec, c, sec);
        if (d < -0.1 || d > 0.6) return null;
        const press = d < 0 ? 1 - (d + 0.1) * 1.6 : 0.84 + Math.min(1, d / 0.22) * 0.16;
        const ring = Math.max(0, Math.min(1, d / 0.5));
        const R = SW * 0.05;
        return (
          <div key={i} style={{ position: 'absolute', left: u * SW - R, top: v * SH - R, width: 2 * R, height: 2 * R }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(58,58,60,.34)', transform: `scale(${press})`, opacity: d < 0.3 ? 1 : 1 - (d - 0.3) / 0.3 }} />
            {d >= 0 && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid rgba(58,58,60,.5)', transform: `scale(${0.6 + ring * 1.1})`, opacity: 1 - ring }} />}
          </div>
        );
      })}
    </div>
  );
};

/* caption words start at speaking pace; the whole line dissolves out over 0.3 s */
const Caption: React.FC<{ spec: Spec; line: Line }> = ({ spec, line: { text, sub, from, to } }) => {
  const f = useCurrentFrame();
  const a = s(from), b = s(to);
  if (f < a || f > b) return null;
  const out = 1 - r(f, b - 9, b, Easing.linear);
  const on = speechOnsets(text, FPS);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 0, height: spec.band, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity: out }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 20px', fontFamily: theme.font, fontWeight: 700, fontSize: spec.title, letterSpacing: '-0.035em', lineHeight: 1.04, color: theme.foreground }}>
        {text.split(' ').map((w, i) => {
          const t0 = a + 6 + on[i];
          const k = r(f, t0, t0 + 8);
          return <span key={i} style={{ display: 'inline-block', opacity: r(f, t0, t0 + 5, Easing.linear), transform: `translateY(${(1 - k) * 24}px)` }}>{w}</span>;
        })}
      </div>
      {sub && <div style={{ marginTop: 16, fontFamily: theme.font, fontSize: spec.sub, fontWeight: 500, color: alpha(theme.foreground, 0.58), opacity: r(f, a + s(1.1), a + s(1.5)) }}>{sub}</div>}
    </div>
  );
};

const Sfx: React.FC<{ src: string; at: number; vol?: number; dur?: number }> = ({ src, at, vol = 0.5, dur = 1.5 }) => (
  <Sequence from={s(at)} durationInFrames={s(dur)} layout="none">
    <Audio src={staticFile(src)} volume={vol} />
  </Sequence>
);

const Preview: React.FC<{ spec: Spec }> = ({ spec }) => (
  <AbsoluteFill style={{ background: palette.base }}>
    <Background style="mesh" palette={palette} speed={1} />
    <Recording spec={spec} />
    {p.lines.map((l, i) => <Caption key={i} spec={spec} line={l} />)}
    {/* the track starts so that its lift lands on the drop */}
    {p.music && <Audio src={staticFile(p.music.src)} trimBefore={Math.max(0, s(p.music.lift - spec.drop))}
      volume={(fr) => (p.music!.volume ?? 0.85) * interpolate(fr, [0, 15, PREVIEW_FRAMES - 30, PREVIEW_FRAMES], [0, 1, 1, 0], clamp)} />}
    {p.tapSound && spec.taps.map(([c, sec], i) => <Sfx key={i} src={p.tapSound!} at={tapTime(spec, c, sec) - 0.03} vol={0.28} dur={1.3} />)}
  </AbsoluteFill>
);

export const AppStorePreview: React.FC = () => <Preview spec={IPHONE} />;
export const AppStorePreviewIPad: React.FC = () => <Preview spec={IPAD} />;
