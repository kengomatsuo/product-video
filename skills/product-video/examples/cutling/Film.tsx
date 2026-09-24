import React from 'react';
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { ThreeCanvas } from '@remotion/three';
import { Background } from './backgrounds';
import { Phone3D, StudioLight, type ScreenTap, type Segment } from './Phone3D';

/*
 * Cutling, 22 bars (43.6 s) at 60 fps, cut to "Hazy After Hours" (Mixkit) from 5.46 s in:
 * 121.5 BPM, a bar every 1.9807 s. The paste lands on the first drop (bar 5), the
 * App Store line on the second (bar 20).
 *
 * Timing follows inspo/product-video-promo/pacing + timing (2026-09-24):
 *   caption on screen >= max(1.6 s, chars / 8), held >= 1.5 s after its last word lands
 *   word entry 0.4 s, exit 0.3 s dissolve (exit faster than entry)
 *   camera moves 1.2-2 s, eased cubic, with a still (drifting) hold of >= 1 s between
 *   transitions 0.8-1 s, every scene boundary on a downbeat
 */
const FPS = 60;
const BAR = 1.9807 * FPS;
const B = (n: number) => Math.round(n * BAR);
const BEAT = BAR / 4;
export const FILM_FRAMES = B(22);

const palette = { base: '#F2F6F4', tints: ['#CDEFE1', '#E5F4EE', '#F4ECD8'], accent: '#17BB8A' };
const INK = '#0F1512';
const FONT = '-apple-system, "SF Pro Display", system-ui, sans-serif';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const outC = Easing.out(Easing.cubic), inC = Easing.in(Easing.cubic);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const r = (f: number, a: number, b: number, e = outC) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const mix = (t: number, a: number, b: number) => a + (b - a) * t;

const WORD_IN = 24; // 0.4 s per word
const TEXT_OUT = 18; // 0.3 s dissolve

/* words rise in one after another, each over 0.4 s, landing on the beat grid */
const BeatWords: React.FC<{ text: string; start: number; size: number; color?: string; per?: number; align?: 'left' | 'center' }> = ({ text, start, size, color = INK, per = BEAT, align = 'center' }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: `0 ${size * 0.25}px`, justifyContent: align === 'left' ? 'flex-start' : 'center', fontFamily: FONT, fontWeight: 700, fontSize: size, letterSpacing: '-0.035em', lineHeight: 1.04, color }}>
      {text.split(' ').map((w, i) => {
        const at = start + i * per;
        const t = r(f, at, at + WORD_IN);
        return <span key={i} style={{ display: 'inline-block', opacity: r(f, at, at + WORD_IN * 0.6, Easing.linear), transform: `translateY(${(1 - t) * size * 0.35}px)` }}>{w}</span>;
      })}
    </div>
  );
};

/* a supporting line that fades up over 0.5 s */
const Sub: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const f = useCurrentFrame();
  const t = r(f, at, at + 30);
  return <div style={{ marginTop: 26, fontFamily: FONT, fontSize: 38, fontWeight: 500, color: 'rgba(15,21,18,.58)', opacity: t, transform: `translateY(${(1 - t) * 14}px)` }}>{text}</div>;
};

/* a caption block that dissolves out over 0.3 s ending `end` frames into the scene */
const Caption: React.FC<{ end: number; side: 'left' | 'right' | 'center'; width: number; children: React.ReactNode }> = ({ end, side, width, children }) => {
  const f = useCurrentFrame();
  const o = 1 - r(f, end - TEXT_OUT, end, Easing.linear);
  const pos = side === 'left' ? { paddingLeft: 170 } : side === 'right' ? { alignItems: 'flex-end' as const, paddingRight: 150 } : { alignItems: 'center' as const };
  return <AbsoluteFill style={{ justifyContent: 'center', opacity: o, ...pos }}><div style={{ width }}>{children}</div></AbsoluteFill>;
};

/* phone rig: position and rotation as functions of the scene frame */
type Rig = (f: number) => { x: number; y: number; z: number; rx: number; ry: number; rz: number; s?: number };
const PhoneShot: React.FC<{ rig: Rig; segments: Segment[]; taps?: ScreenTap[]; blur?: (f: number) => number }> = ({ rig, segments, taps, blur }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = rig(f);
  return (
    <AbsoluteFill style={{ filter: blur ? `blur(${blur(f)}px)` : undefined }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 28, position: [0, 0, 370], near: 1, far: 3000 }} gl={{ antialias: true, alpha: true }}>
        <StudioLight />
        <Phone3D screen={{ segments }} aspect={1320 / 2868} position={[p.x, p.y, p.z]} rotation={[p.rx, p.ry, p.rz]} scale={p.s ?? 1} taps={taps} frame={f} fps={FPS} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/* seconds in a recording -> frames on the scene timeline */
const at = (seg: Segment, sec: number) => seg.from + ((sec - seg.start) / (seg.rate ?? 1)) * FPS;
/* a still of one recording frame, for holds */
const still = (src: string, from: number, frames: number, sec: number): Segment => ({ src, from, frames, start: sec, rate: 0.01 });

const S = { hook: 0, paste: B(2), save: B(8), sort: B(14), every: B(17), end: B(19) };

/* ---------- scene 1: the hook, 2 bars ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const len = S.paste;
  const drift = r(f, 0, len, Easing.linear);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + drift * 0.03})`, opacity: 1 - r(f, len - TEXT_OUT - 6, len - 6, Easing.linear) }}>
      <div style={{ width: 1300 }}><BeatWords text="Stop retyping your address" start={8} size={132} per={22} /></div>
    </AbsoluteFill>
  );
};

/* ---------- scene 2: paste from the keyboard, 6 bars, the insert on the drop ---------- */
const PASTE = 'rec/take-paste3.mp4';
/* onsets in the take: globe menu 4.58, Cutling picked 10.60, Home Address inserted 14.30 */
const DROP = B(5) - S.paste;
const pSeg1: Segment = { src: PASTE, from: 48, frames: 126, start: 3.9 };
const pSeg2: Segment = { src: PASTE, from: 174, frames: DROP - 174, start: 10.35, rate: 1.3 };
const pSeg3: Segment = { src: PASTE, from: DROP, frames: 100, start: 14.3 };
const pasteSegs = [still(PASTE, 0, 48, 3.9), pSeg1, pSeg2, pSeg3, still(PASTE, DROP + 100, B(6), 15.95)];
const pasteTaps: ScreenTap[] = [
  { at: at(pSeg1, 4.05) / FPS, u: 0.098, v: 0.956 },
  { at: at(pSeg2, 10.55) / FPS, u: 0.136, v: 0.82 },
  { at: at(pSeg2, 14.26) / FPS, u: 0.25, v: 0.718 },
];
const Paste: React.FC = () => {
  const f = useCurrentFrame();
  const len = S.save - S.paste;
  const enter = r(f, 0, 84); // 1.4 s glide in from the right while the hook dissolves
  const push = r(f, DROP + 12, DROP + 120, inOut); // 1.8 s push onto the message field
  const spin = r(f, len - 60, len, inC); // 1 s, first half of a turn; the next scene finishes it
  const rig: Rig = (g) => ({
    x: mix(enter, 170, -70) + push * 40 - r(g, 84, DROP, Easing.linear) * 14,
    y: mix(push, -4, 14),
    z: mix(enter, -80, 10) + push * 110,
    rx: mix(push, 0.03, -0.12),
    ry: mix(enter, 0.7, 0.24) - push * 0.1 + spin * Math.PI,
    rz: -0.015,
  });
  return (
    <AbsoluteFill>
      <PhoneShot rig={rig} segments={pasteSegs} taps={pasteTaps} />
      <Caption end={len - 50} side="right" width={640}>
        <BeatWords text="Straight from the keyboard" start={84} size={108} align="left" />
        <Sub text="Works in any app you type in" at={DROP + 40} />
      </Caption>
    </AbsoluteFill>
  );
};

/* ---------- scene 3: save a snippet, 6 bars ---------- */
const ADD = 'rec/take-add.mp4';
/* taps read off the take: + 3.45, Text Cutling 5.35, name 6.75, text field 12.6, Save 19.4.
   7.4-19.0 is the keyboard waiting on the tool, so it plays at 3.2x */
const aSeg1: Segment = { src: ADD, from: 0, frames: 252, start: 3.2 };
const aSeg2: Segment = { src: ADD, from: 252, frames: 218, start: 7.4, rate: 3.2 };
const aSeg3: Segment = { src: ADD, from: 470, frames: 186, start: 19.0 };
const addSegs = [aSeg1, aSeg2, aSeg3, still(ADD, 656, B(6), 22.1)];
const addTaps: ScreenTap[] = [
  { at: at(aSeg1, 3.45) / FPS, u: 0.636, v: 0.088 },
  { at: at(aSeg1, 5.35) / FPS, u: 0.636, v: 0.097 },
  { at: at(aSeg1, 6.75) / FPS, u: 0.5, v: 0.211 },
  { at: at(aSeg2, 12.6) / FPS, u: 0.5, v: 0.565 },
  { at: at(aSeg3, 19.4) / FPS, u: 0.902, v: 0.109 },
];
const typing = [at(aSeg2, 10.4), at(aSeg2, 14.7), at(aSeg2, 17.2)];
const Save: React.FC = () => {
  const f = useCurrentFrame();
  const len = S.sort - S.save;
  const spinIn = r(f, 0, 72); // 1.2 s, second half of the turn
  const through = r(f, len - 54, len, inC); // 0.9 s push through the lens into the next scene
  const rig: Rig = (g) => ({
    x: mix(spinIn, 20, 70) - r(g, 72, len - 54, inOut) * 16,
    y: -2,
    z: mix(spinIn, 60, 0) + through * 340,
    rx: 0.04,
    ry: (1 - spinIn) * -Math.PI - 0.26 + r(g, 72, len - 54, inOut) * 0.12,
    rz: 0.012,
  });
  return (
    <AbsoluteFill>
      <PhoneShot rig={rig} segments={addSegs} taps={addTaps} blur={(g) => r(g, len - 24, len, inC) * 10} />
      <Caption end={len - 40} side="left" width={660}>
        <BeatWords text="Save it once" start={80} size={108} align="left" />
        <Sub text="Name it and it stays in the keyboard" at={80 + 3 * BEAT + 24} />
      </Caption>
    </AbsoluteFill>
  );
};

/* ---------- scene 4: icon and colour, 3 bars ---------- */
const ICON = 'rec/take-icon.mp4';
const iSeg1: Segment = { src: ICON, from: 0, frames: 108, start: 3.2 };
const iSeg2: Segment = { src: ICON, from: 108, frames: 210, start: 11.0 };
const iconSegs = [iSeg1, iSeg2, still(ICON, 318, B(3), 14.45)];
const iconTaps: ScreenTap[] = [
  { at: at(iSeg1, 3.45) / FPS, u: 0.409, v: 0.779 },
  { at: at(iSeg2, 11.45) / FPS, u: 0.614, v: 0.687 },
  { at: at(iSeg2, 13.4) / FPS, u: 0.889, v: 0.404 },
];
const Sort: React.FC = () => {
  const f = useCurrentFrame();
  const len = S.every - S.sort;
  const land = r(f, 0, 72); // 1.2 s, arrives from in front of the lens and settles
  const pull = r(f, len - 60, len, inC); // 1 s pull back to make room for the other devices
  const rig: Rig = (g) => ({
    x: mix(land, -20, -70) - pull * 240,
    y: -4 + pull * 10,
    z: mix(land, 300, 0) - pull * 160,
    rx: 0.04,
    ry: 0.22 - r(g, 72, len - 60, inOut) * 0.12,
    rz: 0.01,
  });
  return (
    <AbsoluteFill>
      <PhoneShot rig={rig} segments={iconSegs} taps={iconTaps} blur={(g) => (1 - r(g, 0, 30)) * 10} />
      <Caption end={len - 36} side="right" width={600}>
        <BeatWords text="Find it by colour" start={60} size={108} align="left" />
      </Caption>
    </AbsoluteFill>
  );
};

/* ---------- scene 5: everywhere, 2 bars ---------- */
const Everywhere: React.FC = () => {
  const f = useCurrentFrame();
  const len = S.end - S.every;
  /* each device lands on its own beat over 0.8 s: Mac, then iPad, then the iPhone slides back in */
  const mac = r(f, 0, 48), pad = r(f, BEAT, BEAT + 48), phone = r(f, 2 * BEAT, 2 * BEAT + 60);
  const fall = r(f, len - 30, len, inC);
  const drift = r(f, 0, len, Easing.linear);
  return (
    <AbsoluteFill style={{ transform: `translateY(${fall * 260}px)`, opacity: 1 - r(f, len - TEXT_OUT, len, Easing.linear) }}>
      <div style={{ position: 'absolute', left: 960 - 430, top: 120 + (1 - mac) * 70, width: 860, height: 820, opacity: mac, transform: `scale(${0.97 + drift * 0.03})`,
        borderRadius: 26, overflow: 'hidden', boxShadow: '0 50px 110px rgba(0,0,0,.16), 0 0 0 1px rgba(0,0,0,.07)' }}>
        <Img src={staticFile('captures/mac-window.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ position: 'absolute', left: 250 - (1 - pad) * 120, top: 300, width: 420, opacity: pad, transform: `rotate(${-5 + drift * 1.5}deg)`,
        borderRadius: 34, padding: 13, background: '#111', boxShadow: '0 50px 90px rgba(0,0,0,.24)' }}>
        <Img src={staticFile('captures/02-iPad_Air_13-inch_M4_-02_MainGrid.png')} style={{ width: '100%', display: 'block', borderRadius: 22 }} />
      </div>
      <PhoneShot segments={[still(ADD, 0, len, 21.8)]}
        rig={() => ({ x: mix(phone, 170, 92), y: -6 + drift * 4, z: 20, rx: 0.06, ry: mix(phone, -0.9, -0.32) + drift * 0.08, rz: 0.03, s: 0.84 })} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 56 }}>
        <BeatWords text="On iPhone, iPad and Mac" start={36} size={60} per={14} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- scene 6: the end, 3 bars ---------- */
const End: React.FC = () => {
  const f = useCurrentFrame();
  /* icon settles over 0.6 s with a soft squash, the name follows, the CTA on the second drop */
  const land = r(f, 0, 36, Easing.bezier(0.3, 0, 0.7, 1));
  const squash = f < 36 ? 1 : 1 - 0.08 * Math.exp(-(f - 36) / 8) * Math.cos((f - 36) / 4.5);
  const ctaAt = B(20) - S.end;
  const cta = r(f, ctaAt, ctaAt + 30);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 }}>
      <Img src={staticFile('icon.png')} style={{ width: 210, height: 210, borderRadius: 47, opacity: r(f, 0, 14, Easing.linear), transform: `translateY(${(1 - land) * -260}px) scale(${1 / Math.sqrt(squash)}, ${squash})`, transformOrigin: 'bottom',
        boxShadow: `0 ${24 * land}px ${60 * land}px rgba(0,0,0,${0.22 * land})` }} />
      <BeatWords text="Cutling" start={BEAT + 10} size={120} />
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

export const Film: React.FC = () => {
  const tapsAbs = [
    ...pasteTaps.map((t) => S.paste + t.at * FPS),
    ...addTaps.map((t) => S.save + t.at * FPS),
    ...iconTaps.map((t) => S.sort + t.at * FPS),
  ];
  return (
    <AbsoluteFill style={{ background: palette.base }}>
      <Background style="mesh" palette={palette} speed={1} />
      <Sequence durationInFrames={S.paste}><Hook /></Sequence>
      <Sequence from={S.paste} durationInFrames={S.save - S.paste}><Paste /></Sequence>
      <Sequence from={S.save} durationInFrames={S.sort - S.save}><Save /></Sequence>
      <Sequence from={S.sort} durationInFrames={S.every - S.sort}><Sort /></Sequence>
      <Sequence from={S.every} durationInFrames={S.end - S.every}><Everywhere /></Sequence>
      <Sequence from={S.end} durationInFrames={FILM_FRAMES - S.end}><End /></Sequence>

      {/* music from its 5.46 s downbeat; out over the last 1.5 s */}
      <Audio src={staticFile('music/music-132.mp3')} trimBefore={Math.round(5.46 * FPS)}
        volume={(fr) => 0.85 * interpolate(fr, [0, 8, FILM_FRAMES - 90, FILM_FRAMES], [0, 1, 1, 0], clamp)} />
      {/* soft swipes peak on each seam */}
      {[S.paste, S.save, S.sort, S.every].map((s, i) => <Sfx key={i} src={i % 2 ? 'sfx-2627' : 'sfx-1490'} at={s - (i % 2 ? 15 : 42)} vol={0.26} />)}
      {tapsAbs.map((t, i) => <Sfx key={`t${i}`} src="sfx-1109" at={t - 2} vol={0.28} dur={40} />)}
      {typing.map((t, i) => <Sfx key={`k${i}`} src="sfx-1386" at={S.save + t} vol={0.16} dur={30} />)}
      {/* riser into the drop, the pop of the paste on it */}
      <Sfx src="sfx-1144" at={B(5) - 3 * FPS} from={3.2} vol={0.28} dur={3 * FPS} />
      <Sfx src="sfx-2357" at={B(5)} vol={0.55} dur={30} />
      {/* the icon landing, then the CTA on the second drop */}
      <Sfx src="sfx-2902" at={S.end + 36 - 1.3 * FPS} vol={0.4} dur={4 * FPS} />
      <Sfx src="sfx-2357" at={B(20)} vol={0.35} dur={30} />
    </AbsoluteFill>
  );
};
