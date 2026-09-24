import React from 'react';
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { ThreeCanvas } from '@remotion/three';
import { syllable } from 'syllable';
import { Background } from './backgrounds';
import { IPAD, Phone3D, StudioLight, type ScreenTap, type Segment } from './Phone3D';
import { MacBook } from './Devices';

/*
 * Cutling, 23 bars (45.6 s) at 60 fps, cut to "Hazy After Hours" (Mixkit) from 5.46 s in:
 * 121.5 BPM, a bar every 1.9807 s. The paste lands on the first drop (bar 5), the
 * icon on the second (bar 20).
 *
 * One phone for the whole film: it slides in from below the frame, spins between
 * scenes while it travels (the recording swaps while its back faces the camera),
 * and settles into the device line-up. Nothing appears out of nowhere.
 *
 * Timing (inspo/product-video-promo/pacing + timing, 2026-09-24):
 *   words start at speaking pace, 6.19 syllables/s (Pellegrino et al. 2011, English)
 *   caption on screen >= max(1.6 s, chars / 8), held >= 1.5 s after its last word
 *   camera moves 1.2-2 s, eased cubic, drifting holds between them
 */
const FPS = 60;
const BAR = 1.9807 * FPS;
const B = (n: number) => Math.round(n * BAR);
const BEAT = BAR / 4;
export const FILM_FRAMES = B(23);

const palette = { base: '#F2F6F4', tints: ['#CDEFE1', '#E5F4EE', '#F4ECD8'], accent: '#17BB8A' };
const INK = '#0F1512';
const FONT = '-apple-system, "SF Pro Display", system-ui, sans-serif';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const outC = Easing.out(Easing.cubic), inC = Easing.in(Easing.cubic);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const r = (f: number, a: number, b: number, e = outC) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const mix = (t: number, a: number, b: number) => a + (b - a) * t;

/* ---------- words at speaking pace ---------- */
const SYLLABLES_PER_S = 6.19;
const WORD_IN = 16; // each word rises over 0.27 s
const TEXT_OUT = 18; // 0.3 s dissolve

/* frame offsets at which each word starts, as if the line were spoken */
export const speechOnsets = (text: string) => {
  let t = 0;
  return text.split(' ').map((w) => {
    const at = t;
    t += syllable(w) / SYLLABLES_PER_S + (/[,.;:]$/.test(w) ? 0.2 : 0);
    return Math.round(at * FPS);
  });
};

const Words: React.FC<{ text: string; start: number; size: number; color?: string; align?: 'left' | 'center' }> = ({ text, start, size, color = INK, align = 'center' }) => {
  const f = useCurrentFrame();
  const onsets = speechOnsets(text);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: `0 ${size * 0.25}px`, justifyContent: align === 'left' ? 'flex-start' : 'center', fontFamily: FONT, fontWeight: 700, fontSize: size, letterSpacing: '-0.035em', lineHeight: 1.04, color }}>
      {text.split(' ').map((w, i) => {
        const at = start + onsets[i];
        const t = r(f, at, at + WORD_IN);
        return <span key={i} style={{ display: 'inline-block', opacity: r(f, at, at + WORD_IN * 0.6, Easing.linear), transform: `translateY(${(1 - t) * size * 0.3}px)` }}>{w}</span>;
      })}
    </div>
  );
};

const Sub: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const f = useCurrentFrame();
  const t = r(f, at, at + 24);
  return <div style={{ marginTop: 26, fontFamily: FONT, fontSize: 38, fontWeight: 500, color: 'rgba(15,21,18,.58)', opacity: t, transform: `translateY(${(1 - t) * 12}px)` }}>{text}</div>;
};

/* a caption block beside the phone; dissolves out over 0.3 s, ending at `end` */
const Caption: React.FC<{ end: number; side: 'left' | 'right' | 'top'; width: number; children: React.ReactNode }> = ({ end, side, width, children }) => {
  const f = useCurrentFrame();
  const o = 1 - r(f, end - TEXT_OUT, end, Easing.linear);
  const pos = side === 'left' ? { justifyContent: 'center', paddingLeft: 170 }
    : side === 'right' ? { justifyContent: 'center', alignItems: 'flex-end' as const, paddingRight: 150 }
    : { alignItems: 'center' as const, paddingTop: 70 };
  return <AbsoluteFill style={{ opacity: o, ...pos }}><div style={{ width }}>{children}</div></AbsoluteFill>;
};

/* ---------- the scene plan (film frames) ---------- */
const STAGE0 = B(2) - 36; // the phone starts rising while the hook dissolves
const SCENE = { paste: B(2), save: B(8), sort: B(14), sync: B(17), end: B(20) };
const DROP = B(5);
const L = (f: number) => f - STAGE0; // film frame -> stage frame

/* ---------- screen content, on the stage timeline ---------- */
const still = (src: string, from: number, frames: number, sec: number): Segment => ({ src, from: L(from), frames, start: sec, rate: 0.01 });
const seg = (src: string, from: number, frames: number, start: number, rate = 1): Segment => ({ src, from: L(from), frames, start, rate });
const tapAt = (s: Segment, sec: number) => s.from + ((sec - s.start) / (s.rate ?? 1)) * FPS; // stage frame

/* paste take onsets: globe menu 4.58, Cutling picked 10.60, Home Address inserted 14.30 */
const PASTE = 'rec/take-paste3.mp4';
const p1 = seg(PASTE, SCENE.paste + 48, 126, 3.9);
const p2 = seg(PASTE, SCENE.paste + 174, DROP - SCENE.paste - 174, 10.35, 1.3);
const p3 = seg(PASTE, DROP, 100, 14.3);
/* add take taps: + 3.45, Text Cutling 5.35, name 6.75, text field 12.6, Save 19.4.
   7.4-19.0 is the keyboard waiting on the tool, so it plays at 3.2x */
const ADD = 'rec/take-add.mp4';
const a1 = seg(ADD, SCENE.save + 50, 252, 3.2);
const a2 = seg(ADD, SCENE.save + 302, 218, 7.4, 3.2);
const a3 = seg(ADD, SCENE.save + 520, 186, 19.0);
const ICON = 'rec/take-icon.mp4';
const i1 = seg(ICON, SCENE.sort + 50, 108, 3.2);
const i2 = seg(ICON, SCENE.sort + 158, SCENE.sync + 12 - SCENE.sort - 158, 11.0);

const phoneSegs: Segment[] = [
  still(PASTE, STAGE0, SCENE.paste + 48 - STAGE0, 3.9), p1, p2, p3,
  still(PASTE, DROP + 100, SCENE.save - DROP - 100, 15.95),
  still(ADD, SCENE.save, 50, 3.2), a1, a2, a3,
  still(ADD, SCENE.save + 706, SCENE.sort - SCENE.save - 706, 22.1),
  still(ICON, SCENE.sort, 50, 3.2), i1, i2,
  still(ADD, SCENE.sync + 12, B(23), 22.1), // the library, swapped mid-spin into the line-up
];
const phoneTaps: ScreenTap[] = [
  [tapAt(p1, 4.05), 0.098, 0.956], [tapAt(p2, 10.55), 0.136, 0.82], [tapAt(p2, 14.26), 0.25, 0.718],
  [tapAt(a1, 3.45), 0.636, 0.088], [tapAt(a1, 5.35), 0.636, 0.097], [tapAt(a1, 6.75), 0.5, 0.211], [tapAt(a2, 12.6), 0.5, 0.565], [tapAt(a3, 19.4), 0.902, 0.109],
  [tapAt(i1, 3.45), 0.409, 0.779], [tapAt(i2, 11.45), 0.614, 0.687], [tapAt(i2, 13.4), 0.889, 0.404],
].map(([f, u, v]) => ({ at: f / FPS, u, v }));
const typing = [tapAt(a2, 10.4), tapAt(a2, 14.7), tapAt(a2, 17.2)];

/* ---------- the phone's path ---------- */
type Pose = { x: number; y: number; z: number; rx: number; ry: number; rz: number; s: number };
type Move = { a: number; b: number; to: Pose; spin?: number; ease?: (t: number) => number };
const P = (x: number, y: number, z: number, rx: number, ry: number, rz = 0, s = 1): Pose => ({ x, y, z, rx, ry, rz, s });
const lerpPose = (p: Pose, q: Pose, t: number): Pose => ({ x: mix(t, p.x, q.x), y: mix(t, p.y, q.y), z: mix(t, p.z, q.z), rx: mix(t, p.rx, q.rx), ry: mix(t, p.ry, q.ry), rz: mix(t, p.rz, q.rz), s: mix(t, p.s, q.s) });
/* play the moves in order; between moves the pose holds and only drifts */
const path = (start: Pose, moves: Move[]) => (f: number): Pose => {
  let cur = start;
  for (const m of moves) {
    if (f >= m.b) { cur = m.to; continue; }
    if (f <= m.a) break;
    const t = (m.ease ?? inOut)((f - m.a) / (m.b - m.a));
    const p = lerpPose(cur, m.to, t);
    return { ...p, ry: p.ry + (m.spin ?? 0) * 2 * Math.PI * t };
  }
  return cur;
};
const drift = (f: number) => ({ y: Math.sin((f / FPS) * (2 * Math.PI / 9)) * 1.6, ry: Math.sin((f / FPS) * (2 * Math.PI / 11)) * 0.035 });

/* phone right with the caption left, then left, then right; spins land each swap on a downbeat */
const PASTE_POSE = P(70, -4, 10, 0.03, -0.24, 0.015);
const PUSH_POSE = P(36, 14, 115, -0.12, -0.14, 0.01);
const SAVE_POSE = P(-70, -2, 0, 0.04, 0.26, -0.012);
const SORT_POSE = P(70, -4, 0, 0.04, -0.22, 0.01);
const LINEUP_POSE = P(108, -18, 40, 0.05, -0.3, 0.02, 0.6);
const phonePath = path(P(70, -215, 10, 0.35, -0.5, 0.04), [
  { a: STAGE0, b: SCENE.paste + 60, to: PASTE_POSE, ease: outC },
  { a: DROP + 12, b: DROP + 120, to: PUSH_POSE },
  { a: SCENE.save - 54, b: SCENE.save + 54, to: SAVE_POSE, spin: 1 },
  { a: SCENE.sort - 54, b: SCENE.sort + 54, to: SORT_POSE, spin: -1 },
  { a: SCENE.sync - 36, b: SCENE.sync + 60, to: LINEUP_POSE, spin: 1 },
  { a: SCENE.end - 24, b: SCENE.end + 30, to: { ...LINEUP_POSE, y: -230 }, ease: inC },
]);
/* iPad slides in from the left, the MacBook rises from below and opens */
const IPAD_POSE = P(-100, -12, 20, 0.05, 0.3, -0.02, 0.4);
const ipadPath = path({ ...IPAD_POSE, x: -330 }, [
  { a: SCENE.sync, b: SCENE.sync + 72, to: IPAD_POSE, ease: outC },
  { a: SCENE.end - 30, b: SCENE.end + 24, to: { ...IPAD_POSE, y: -260 }, ease: inC },
]);
const MAC_POSE = P(0, -16, -90, 0.24, 0, 0, 0.44);
const macPath = path({ ...MAC_POSE, y: -260 }, [
  { a: SCENE.sync + 14, b: SCENE.sync + 90, to: MAC_POSE, ease: outC },
  { a: SCENE.end - 36, b: SCENE.end + 18, to: { ...MAC_POSE, y: -300 }, ease: inC },
]);

const Stage: React.FC = () => {
  const g = useCurrentFrame(); // stage frame
  const { width, height } = useVideoConfig();
  const f = g + STAGE0;
  const ph = phonePath(f), d = drift(f), ip = ipadPath(f), mac = macPath(f);
  const lid = r(f, SCENE.sync + 50, SCENE.sync + 110, inOut);
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 28, position: [0, 0, 370], near: 60, far: 1500 }} gl={{ antialias: true, alpha: true }}>
      <StudioLight />
      {f >= SCENE.sync - 10 && (
        <>
          <MacBook screen="captures/mac-welcome.png" open={lid} position={[mac.x, mac.y + d.y, mac.z]} rotation={[mac.rx, mac.ry, mac.rz]} scale={mac.s} />
          <Phone3D body={IPAD} tablet screen={{ image: 'captures/02-iPad_Air_13-inch_M4_-02_MainGrid.png' }} aspect={2048 / 2732} color="#c9ccd0" shadow={0.25}
            position={[ip.x, ip.y + d.y, ip.z]} rotation={[ip.rx, ip.ry + d.ry, ip.rz]} scale={ip.s} />
        </>
      )}
      <Phone3D screen={{ segments: phoneSegs }} aspect={1320 / 2868} position={[ph.x, ph.y + d.y, ph.z]} rotation={[ph.rx, ph.ry + d.ry, ph.rz]} scale={ph.s}
        taps={phoneTaps} frame={g} fps={FPS} />
    </ThreeCanvas>
  );
};

/* ---------- captions ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const len = SCENE.paste;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + r(f, 0, len, Easing.linear) * 0.03})`, opacity: 1 - r(f, len - 40, len - 22, Easing.linear) }}>
      <div style={{ width: 1300 }}><Words text="Stop retyping your address" start={12} size={132} /></div>
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => (
  <>
    <Sequence from={SCENE.paste} durationInFrames={SCENE.save - SCENE.paste} layout="none">
      <Caption end={SCENE.save - SCENE.paste - 60} side="left" width={660}>
        <Words text="Straight from the keyboard" start={70} size={108} align="left" />
        <Sub text="Works in any app you type in" at={DROP - SCENE.paste + 40} />
      </Caption>
    </Sequence>
    <Sequence from={SCENE.save} durationInFrames={SCENE.sort - SCENE.save} layout="none">
      <Caption end={SCENE.sort - SCENE.save - 60} side="right" width={640}>
        <Words text="Save it once" start={60} size={108} align="left" />
        <Sub text="Name it and it stays in the keyboard" at={130} />
      </Caption>
    </Sequence>
    <Sequence from={SCENE.sort} durationInFrames={SCENE.sync - SCENE.sort} layout="none">
      <Caption end={SCENE.sync - SCENE.sort - 44} side="left" width={620}>
        <Words text="Find it by colour" start={60} size={108} align="left" />
      </Caption>
    </Sequence>
    <Sequence from={SCENE.sync} durationInFrames={SCENE.end - SCENE.sync} layout="none">
      <Caption end={SCENE.end - SCENE.sync - 34} side="top" width={1400}>
        <Words text="Synced with iCloud" start={40} size={92} />
        <div style={{ textAlign: 'center' }}><Sub text="On iPhone, iPad and Mac" at={40 + 70} /></div>
      </Caption>
    </Sequence>
  </>
);

/* ---------- the end: the icon on the second drop ---------- */
const End: React.FC = () => {
  const f = useCurrentFrame();
  const land = r(f, 0, 36, Easing.bezier(0.3, 0, 0.7, 1));
  const squash = f < 36 ? 1 : 1 - 0.08 * Math.exp(-(f - 36) / 8) * Math.cos((f - 36) / 4.5);
  const ctaAt = B(21) - SCENE.end;
  const cta = r(f, ctaAt, ctaAt + 30);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 }}>
      <Img src={staticFile('icon.png')} style={{ width: 210, height: 210, borderRadius: 47, opacity: r(f, 0, 14, Easing.linear), transform: `translateY(${(1 - land) * -260}px) scale(${1 / Math.sqrt(squash)}, ${squash})`, transformOrigin: 'bottom',
        boxShadow: `0 ${24 * land}px ${60 * land}px rgba(0,0,0,${0.22 * land})` }} />
      <Words text="Cutling" start={BEAT + 10} size={120} />
      <div style={{ opacity: cta, transform: `translateY(${(1 - cta) * 16}px)`, padding: '18px 44px', borderRadius: 999, background: INK, color: '#fff', fontFamily: FONT, fontWeight: 650, fontSize: 38 }}>
        On the App Store
      </div>
    </AbsoluteFill>
  );
};

/* ---------- sound ---------- */
const Sfx: React.FC<{ src: string; at: number; vol?: number; from?: number; dur?: number }> = ({ src, at, vol = 0.5, from = 0, dur = 90 }) => (
  <Sequence from={Math.round(at)} durationInFrames={dur} layout="none">
    <Audio src={staticFile(`sfx/${src}.mp3`)} volume={vol} trimBefore={Math.round(from * FPS)} />
  </Sequence>
);

export const Film: React.FC = () => (
  <AbsoluteFill style={{ background: palette.base }}>
    <Background style="mesh" palette={palette} speed={1} />
    <Sequence durationInFrames={SCENE.paste}><Hook /></Sequence>
    <Sequence from={STAGE0} durationInFrames={SCENE.end + 40 - STAGE0}><Stage /></Sequence>
    <Captions />
    <Sequence from={SCENE.end} durationInFrames={FILM_FRAMES - SCENE.end}><End /></Sequence>

    {/* music from its 5.46 s downbeat; out over the last 1.5 s */}
    <Audio src={staticFile('music/music-132.mp3')} trimBefore={Math.round(5.46 * FPS)}
      volume={(fr) => 0.85 * interpolate(fr, [0, 8, FILM_FRAMES - 90, FILM_FRAMES], [0, 1, 1, 0], clamp)} />
    {/* whooshes peak mid-spin (0.70 s into 1490), a swipe under each device slide */}
    {[SCENE.save, SCENE.sort].map((s, i) => <Sfx key={i} src="sfx-1490" at={s - 42} vol={0.26} />)}
    <Sfx src="sfx-2627" at={SCENE.paste - 15} vol={0.2} />
    {[SCENE.sync + 20, SCENE.sync + 40].map((s, i) => <Sfx key={`d${i}`} src="sfx-2627" at={s - 15} vol={0.18} />)}
    {phoneTaps.map((t, i) => <Sfx key={`t${i}`} src="sfx-1109" at={STAGE0 + t.at * FPS - 2} vol={0.28} dur={40} />)}
    {typing.map((t, i) => <Sfx key={`k${i}`} src="sfx-1386" at={STAGE0 + t} vol={0.16} dur={30} />)}
    {/* riser into the drop, the pop of the paste on it */}
    <Sfx src="sfx-1144" at={DROP - 3 * FPS} from={3.2} vol={0.28} dur={3 * FPS} />
    <Sfx src="sfx-2357" at={DROP} vol={0.55} dur={30} />
    {/* the icon lands on the second drop, the CTA a bar later */}
    <Sfx src="sfx-2902" at={SCENE.end + 36 - 1.3 * FPS} vol={0.4} dur={4 * FPS} />
    <Sfx src="sfx-2357" at={B(21)} vol={0.3} dur={30} />
  </AbsoluteFill>
);
