import React from 'react';
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Audio, Video } from '@remotion/media';
import { Background } from './backgrounds';
import { speechOnsets } from './Film';

/*
 * App Store preview, iPhone 6.9-inch: 886 x 1920, 30 fps, 29.5 s (Apple: 15-30 s, <= 30 fps,
 * screen captures of the app only, text overlays allowed; checked 2026-09-24).
 * Built for portrait: a caption band on top, the real recording below in a rounded
 * screen at the capture's own aspect (1320:2868), so nothing is cropped or letterboxed.
 */
const FPS = 30;
export const PREVIEW_FRAMES = Math.round(29.5 * FPS);
const W = 886, H = 1920;
const BAND = 360; // caption band height
const SW = 700, SH = Math.round(SW * 2868 / 1320); // 700 x 1521
const SX = (W - SW) / 2, SY = BAND + 10;

const palette = { base: '#F2F6F4', tints: ['#CDEFE1', '#E5F4EE', '#F4ECD8'], accent: '#17BB8A' };
const INK = '#0F1512';
const FONT = '-apple-system, "SF Pro Display", system-ui, sans-serif';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const outC = Easing.out(Easing.cubic), inOut = Easing.bezier(0.65, 0, 0.35, 1);
const r = (f: number, a: number, b: number, e = outC) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const s = (sec: number) => Math.round(sec * FPS);

/* a piece of a recording: `at` on the preview timeline, [from, to] seconds in the take */
type Cut = { src: string; at: number; from: number; to: number };
const PASTE = 'rec/take-paste4.mp4', SAVE = 'rec/take-save.mp4';
/* every action plays at speed; only the tool's dead waits are cut, on identical frames */
const cuts: Cut[] = [
  { src: PASTE, at: 0.0, from: 3.8, to: 6.0 }, // keyboard list 4.8
  { src: PASTE, at: 2.2, from: 8.2, to: 10.2 }, // Cutling keyboard 9.0
  { src: PASTE, at: 4.2, from: 12.0, to: 16.0 }, // Home Address inserted 13.0 (t 5.2, the lift)
  { src: SAVE, at: 8.2, from: 4.2, to: 5.8 }, // + 4.6
  { src: SAVE, at: 9.8, from: 7.6, to: 9.6 }, // Text Cutling 8.4
  { src: SAVE, at: 11.8, from: 11.8, to: 14.9 }, // name typed 14.0
  { src: SAVE, at: 14.9, from: 16.8, to: 21.0 }, // text typed 20.0, a second to read it
  { src: SAVE, at: 19.1, from: 23.4, to: 25.6 }, // colour 24.0
  { src: SAVE, at: 21.3, from: 26.6, to: 28.2 }, // orange 27.2
  { src: SAVE, at: 22.9, from: 30.1, to: 31.4 }, // picker closed 30.6
  { src: SAVE, at: 24.2, from: 33.7, to: 35.15 }, // saved 34.2
];
const HOLD_AT = 24.2 + (35.15 - 33.7); // the grid holds from here to the end
const DISSOLVE = 0.4;

/* taps: preview seconds, screen fractions */
const tapTime = (c: number, sec: number) => cuts[c].at + (sec - cuts[c].from);
const taps = [
  [tapTime(0, 4.35), 0.098, 0.956], [tapTime(1, 8.95), 0.136, 0.82], [tapTime(2, 12.97), 0.25, 0.718],
  [tapTime(3, 4.57), 0.636, 0.088], [tapTime(4, 8.37), 0.636, 0.097], [tapTime(5, 12.55), 0.5, 0.211], [tapTime(6, 17.55), 0.5, 0.565],
  [tapTime(7, 23.95), 0.877, 0.399], [tapTime(8, 27.15), 0.609, 0.687], [tapTime(9, 30.55), 0.889, 0.404], [tapTime(10, 34.15), 0.902, 0.109],
];
const SAVED = tapTime(10, 34.2);

const Recording: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  /* dissolve where the take changes (paste -> save) */
  const xf = r(f, s(8.2), s(8.2 + DISSOLVE), Easing.linear);
  /* after the save, a slow push onto the new card at the bottom of the grid */
  const push = r(f, s(SAVED + 0.6), s(SAVED + 2.2), inOut);
  const k = 1 + push * 0.35, oy = push * 0.8;
  return (
    <div style={{ position: 'absolute', left: SX, top: SY, width: SW, height: SH, borderRadius: 54, overflow: 'hidden',
      boxShadow: '0 30px 80px rgba(15,21,18,.18), 0 0 0 1px rgba(15,21,18,.06)', background: '#fff' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${k})`, transformOrigin: `${50 - push * 26}% ${oy * 100}%` /* the new card sits in the left column */ }}>
        {cuts.map((c, i) => {
          const len = s(c.to - c.from) + (i === 2 ? s(DISSOLVE) : 0);
          return (
            <Sequence key={i} from={s(c.at)} durationInFrames={len} layout="none">
              <div style={{ position: 'absolute', inset: 0, opacity: c.src === PASTE ? 1 : xf /* the incoming take sits on top, so it fades in */ }}>
                <Video src={staticFile(c.src)} trimBefore={s(c.from)} muted style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>
            </Sequence>
          );
        })}
        {/* the grid with the new card holds to the end: its own still segment (a rate change
            mid-segment re-times the whole segment and showed its first frame) */}
        <Sequence from={s(HOLD_AT)} layout="none">
          <Video src={staticFile(SAVE)} trimBefore={s(35.1)} playbackRate={0.01} muted style={{ width: '100%', height: '100%', display: 'block' }} />
        </Sequence>
        {taps.map(([at, u, v], i) => {
          const d = t - at;
          if (d < -0.1 || d > 0.6) return null;
          const press = d < 0 ? 1 - (d + 0.1) * 1.6 : 0.84 + Math.min(1, d / 0.22) * 0.16;
          const ring = Math.max(0, Math.min(1, d / 0.5));
          const R = 36;
          return (
            <div key={i} style={{ position: 'absolute', left: u * SW - R, top: v * SH - R, width: 2 * R, height: 2 * R }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(58,58,60,.34)', transform: `scale(${press})`, opacity: d < 0.3 ? 1 : 1 - (d - 0.3) / 0.3 }} />
              {d >= 0 && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid rgba(58,58,60,.5)', transform: `scale(${0.6 + ring * 1.1})`, opacity: 1 - ring }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* caption words start at speaking pace; the whole line dissolves out over 0.3 s */
const Line: React.FC<{ text: string; sub?: string; from: number; to: number }> = ({ text, sub, from, to }) => {
  const f = useCurrentFrame();
  const a = s(from), b = s(to);
  const out = 1 - r(f, b - 9, b, Easing.linear);
  if (f < a || f > b) return null;
  const on = speechOnsets(text).map((o) => Math.round(o / 2)); // Film onsets are 60 fps frames
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 0, height: BAND, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity: out }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 20px', fontFamily: FONT, fontWeight: 700, fontSize: 84, letterSpacing: '-0.035em', lineHeight: 1.04, color: INK }}>
        {text.split(' ').map((w, i) => {
          const t0 = a + 6 + on[i];
          const k = r(f, t0, t0 + 8);
          return <span key={i} style={{ display: 'inline-block', opacity: r(f, t0, t0 + 5, Easing.linear), transform: `translateY(${(1 - k) * 24}px)` }}>{w}</span>;
        })}
      </div>
      {sub && <div style={{ marginTop: 16, fontFamily: FONT, fontSize: 38, fontWeight: 500, color: 'rgba(15,21,18,.58)', opacity: r(f, a + s(1.1), a + s(1.5)) }}>{sub}</div>}
    </div>
  );
};

const Sfx: React.FC<{ src: string; at: number; vol?: number; dur?: number }> = ({ src, at, vol = 0.5, dur = 1.5 }) => (
  <Sequence from={s(at)} durationInFrames={s(dur)} layout="none">
    <Audio src={staticFile(`sfx/${src}.mp3`)} volume={vol} />
  </Sequence>
);

export const AppStorePreview: React.FC = () => (
  <AbsoluteFill style={{ background: palette.base }}>
    <Background style="mesh" palette={palette} speed={1} />
    <Recording />
    <Line text="Stop retyping your address" from={0} to={3.3} />
    <Line text="Straight from the keyboard" sub="Works in any app you type in" from={3.5} to={8.1} />
    <Line text="Save it once" sub="Name it and it stays in the keyboard" from={8.4} to={18.9} />
    <Line text="Find it by colour" sub="Pick a colour for each one" from={19.2} to={26.6} />
    <Line text="Cutling" sub="Save once, paste anywhere" from={26.8} to={29.5} />
    {/* Revival: its 33.94 s lift lands on the insert at 5.2 s */}
    <Audio src={staticFile('music/pixabay-revival-234210.mp3')} trimBefore={s(33.94 - 5.2)}
      volume={(fr) => 0.85 * interpolate(fr, [0, 15, PREVIEW_FRAMES - 30, PREVIEW_FRAMES], [0, 1, 1, 0], clamp)} />
    {taps.map(([at], i) => <Sfx key={i} src="sfx-1109" at={at - 0.03} vol={0.28} dur={1.3} />)}
    <Sfx src="sfx-2357" at={5.2} vol={0.5} dur={1} />
  </AbsoluteFill>
);
