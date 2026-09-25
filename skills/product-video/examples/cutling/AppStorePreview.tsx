import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Audio, Video } from '@remotion/media';
import { Background } from './backgrounds';
import { speechOnsets } from './words';

/*
 * App Store previews: 15-30 s, <= 30 fps, screen captures of the app only, text overlays
 * allowed (developer.apple.com app preview specifications + Guideline 2.3.4, 2026-09-24).
 * Designed for portrait: a caption band on top, the real recording below in a rounded
 * screen at the capture's own aspect, never cropped, never zoomed, no device frame.
 * iPhone 6.9-inch 886 x 1920; iPad 13-inch 1200 x 1600.
 */
export const FPS = 30;
export const PREVIEW_FRAMES = Math.round(29.5 * FPS);

const palette = { base: '#F2F6F4', tints: ['#CDEFE1', '#E5F4EE', '#F4ECD8'], accent: '#17BB8A' };
const INK = '#0F1512';
const FONT = '-apple-system, "SF Pro Display", system-ui, sans-serif';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const outC = Easing.out(Easing.cubic);
const r = (f: number, a: number, b: number, e = outC) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const s = (sec: number) => Math.round(sec * FPS);
const DISSOLVE = 0.4;

/* a piece of a recording: `at` on the preview timeline, [from, to] seconds in the take.
   `hold` freezes the `from` frame until the next cut. Every action plays at speed; only
   the tool's dead waits are cut, on identical frames. */
type Cut = { src: string; at: number; from: number; to: number; hold?: boolean };
type Tap = [cut: number, sec: number, u: number, v: number];
type Spec = { w: number; h: number; band: number; title: number; sub: number; capture: [number, number]; radius: number; cuts: Cut[]; taps: Tap[]; swap: number; drop: number };

const IP_PASTE = 'rec/take-paste4.mp4', IP_SAVE = 'rec/take-save.mp4';
const IPHONE: Spec = {
  w: 886, h: 1920, band: 360, title: 84, sub: 38, capture: [1320, 2868], radius: 54, swap: 8.2, drop: 5.2,
  cuts: [
    { src: IP_PASTE, at: 0.0, from: 3.8, to: 6.0 }, // keyboard list 4.8
    { src: IP_PASTE, at: 2.2, from: 8.2, to: 10.2 }, // Cutling keyboard 9.0
    { src: IP_PASTE, at: 4.2, from: 12.0, to: 16.0 }, // Home Address inserted 13.0
    { src: IP_SAVE, at: 8.2, from: 4.2, to: 5.8 }, // + 4.6
    { src: IP_SAVE, at: 9.8, from: 7.6, to: 9.6 }, // Text Cutling 8.4
    { src: IP_SAVE, at: 11.8, from: 11.8, to: 14.9 }, // name typed 14.0
    { src: IP_SAVE, at: 14.9, from: 16.8, to: 21.0 }, // text typed 20.0
    { src: IP_SAVE, at: 19.1, from: 23.4, to: 25.6 }, // colour 24.0
    { src: IP_SAVE, at: 21.3, from: 26.6, to: 28.2 }, // orange 27.2
    { src: IP_SAVE, at: 22.9, from: 30.1, to: 31.4 }, // picker closed 30.6
    { src: IP_SAVE, at: 24.2, from: 33.7, to: 35.15 }, // saved 34.2
    { src: IP_SAVE, at: 25.65, from: 35.1, to: 35.1, hold: true },
  ],
  taps: [
    [0, 4.35, 0.098, 0.956], [1, 8.95, 0.136, 0.82], [2, 12.97, 0.25, 0.718],
    [3, 4.57, 0.636, 0.088], [4, 8.37, 0.636, 0.097], [5, 12.55, 0.5, 0.211], [6, 17.55, 0.5, 0.565],
    [7, 23.95, 0.877, 0.399], [8, 27.15, 0.609, 0.687], [9, 30.55, 0.889, 0.404], [10, 34.15, 0.902, 0.109],
  ],
};

/* iPad takes, after a warm-up run: globe menu 5.22, Cutling 9.25, Home Address 13.08;
   + 8.98, Text Cutling 10.02, name 12.32, text 18.23, colour 24.57, orange 27.90,
   picker closed 31.80, saved 35.75 */
const PAD_PASTE = 'rec/ipad-paste.mp4', PAD_SAVE = 'rec/ipad-save.mp4';
const IPAD: Spec = {
  w: 1200, h: 1600, band: 330, title: 92, sub: 40, capture: [2064, 2752], radius: 34, swap: 8.2, drop: 5.2,
  cuts: [
    { src: PAD_PASTE, at: 0.0, from: 3.9, to: 6.1 },
    { src: PAD_PASTE, at: 2.2, from: 8.45, to: 10.45 },
    { src: PAD_PASTE, at: 4.2, from: 12.08, to: 14.1 },
    { src: PAD_PASTE, at: 6.22, from: 14.1, to: 14.1, hold: true },
    { src: PAD_SAVE, at: 8.2, from: 8.6, to: 10.4 },
    { src: PAD_SAVE, at: 10.0, from: 11.9, to: 14.6 },
    { src: PAD_SAVE, at: 12.7, from: 17.9, to: 26.3 },
    { src: PAD_SAVE, at: 21.1, from: 27.5, to: 29.0 },
    { src: PAD_SAVE, at: 22.6, from: 31.4, to: 32.6 },
    { src: PAD_SAVE, at: 23.8, from: 35.4, to: 37.2 },
    { src: PAD_SAVE, at: 25.6, from: 37.15, to: 37.15, hold: true },
  ],
  taps: [
    [0, 4.85, 0.027, 0.967], [1, 9.22, 0.061, 0.901], [2, 13.05, 0.1, 0.788],
    [4, 8.95, 0.611, 0.039], [4, 9.99, 0.62, 0.043], [5, 12.29, 0.5, 0.355], [6, 18.2, 0.5, 0.45],
    [6, 24.54, 0.736, 0.339], [7, 27.87, 0.567, 0.337], [8, 31.77, 0.281, 0.182], [9, 35.72, 0.749, 0.137],
  ],
};

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
      boxShadow: '0 30px 80px rgba(15,21,18,.18), 0 0 0 1px rgba(15,21,18,.06)', background: '#fff' }}>
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
const Line: React.FC<{ spec: Spec; text: string; sub?: string; from: number; to: number }> = ({ spec, text, sub, from, to }) => {
  const f = useCurrentFrame();
  const a = s(from), b = s(to);
  if (f < a || f > b) return null;
  const out = 1 - r(f, b - 9, b, Easing.linear);
  const on = speechOnsets(text, FPS);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 0, height: spec.band, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity: out }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 20px', fontFamily: FONT, fontWeight: 700, fontSize: spec.title, letterSpacing: '-0.035em', lineHeight: 1.04, color: INK }}>
        {text.split(' ').map((w, i) => {
          const t0 = a + 6 + on[i];
          const k = r(f, t0, t0 + 8);
          return <span key={i} style={{ display: 'inline-block', opacity: r(f, t0, t0 + 5, Easing.linear), transform: `translateY(${(1 - k) * 24}px)` }}>{w}</span>;
        })}
      </div>
      {sub && <div style={{ marginTop: 16, fontFamily: FONT, fontSize: spec.sub, fontWeight: 500, color: 'rgba(15,21,18,.58)', opacity: r(f, a + s(1.1), a + s(1.5)) }}>{sub}</div>}
    </div>
  );
};

const Sfx: React.FC<{ src: string; at: number; vol?: number; dur?: number }> = ({ src, at, vol = 0.5, dur = 1.5 }) => (
  <Sequence from={s(at)} durationInFrames={s(dur)} layout="none">
    <Audio src={staticFile(`sfx/${src}.mp3`)} volume={vol} />
  </Sequence>
);

const Preview: React.FC<{ spec: Spec }> = ({ spec }) => (
  <AbsoluteFill style={{ background: palette.base }}>
    <Background style="mesh" palette={palette} speed={1} />
    <Recording spec={spec} />
    <Line spec={spec} text="Stop retyping your address" from={0} to={3.3} />
    <Line spec={spec} text="Straight from the keyboard" sub="Works in any app you type in" from={3.5} to={8.1} />
    <Line spec={spec} text="Save it once" sub="Name it and it stays in the keyboard" from={8.4} to={18.9} />
    <Line spec={spec} text="Find it by colour" sub="Pick a colour for each one" from={19.2} to={26.6} />
    <Line spec={spec} text="Cutling" sub="Save once, paste anywhere" from={26.8} to={29.5} />
    {/* Revival: its 33.94 s lift lands on the insert */}
    <Audio src={staticFile('music/pixabay-revival-234210.mp3')} trimBefore={s(33.94 - spec.drop)}
      volume={(fr) => 0.85 * interpolate(fr, [0, 15, PREVIEW_FRAMES - 30, PREVIEW_FRAMES], [0, 1, 1, 0], clamp)} />
    {spec.taps.map(([c, sec], i) => <Sfx key={i} src="sfx-1109" at={tapTime(spec, c, sec) - 0.03} vol={0.28} dur={1.3} />)}
    <Sfx src="sfx-2357" at={spec.drop} vol={0.5} dur={1} />
  </AbsoluteFill>
);

export const AppStorePreview: React.FC = () => <Preview spec={IPHONE} />;
export const AppStorePreviewIPad: React.FC = () => <Preview spec={IPAD} />;
