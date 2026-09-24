import React from 'react';
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { ThreeCanvas } from '@remotion/three';
import { Background } from './backgrounds';
import { Phone3D, StudioLight, type ScreenTap, type Segment } from './Phone3D';

/*
 * Cutling, 25 s at 60 fps, cut to "Hazy After Hours" (Mixkit) from 5.46 s in the track:
 * 121.5 BPM, a bar every 1.9807 s, the drop 9.90 s into the film (bar 5).
 * Every scene boundary sits on a downbeat; the paste lands on the drop.
 */
const FPS = 60;
const BAR = 1.9807 * FPS;
const B = (n: number) => Math.round(n * BAR);
const BEAT = BAR / 4;
export const FILM_FRAMES = 1500;

const palette = { base: '#F2F6F4', tints: ['#CDEFE1', '#E5F4EE', '#F4ECD8'], accent: '#17BB8A' };
const INK = '#0F1512';
const FONT = '-apple-system, "SF Pro Display", system-ui, sans-serif';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const p4in = Easing.in(Easing.poly(5)), p4out = Easing.out(Easing.poly(5));
const expoOut = Easing.out(Easing.exp), easeIO = Easing.bezier(0.65, 0, 0.35, 1);
const r = (f: number, a: number, b: number, e = p4out) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const mix = (t: number, a: number, b: number) => a + (b - a) * t;

/* one word per beat, rising from below, binary opacity (waterfall on the beat grid) */
const BeatWords: React.FC<{ text: string; start: number; size: number; color?: string; per?: number; align?: 'left' | 'center' }> = ({ text, start, size, color = INK, per = BEAT, align = 'center' }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: `0 ${size * 0.25}px`, justifyContent: align === 'left' ? 'flex-start' : 'center', fontFamily: FONT, fontWeight: 700, fontSize: size, letterSpacing: '-0.035em', lineHeight: 1.02, color }}>
      {text.split(' ').map((w, i) => {
        const at = start + i * per - 2; // lands a hair before the beat so the eye meets it on it
        const t = r(f, at, at + 9, expoOut);
        return <span key={i} style={{ display: 'inline-block', opacity: f >= at ? 1 : 0, transform: `translateY(${(1 - t) * size * 0.55}px)` }}>{w}</span>;
      })}
    </div>
  );
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

/* ---------- scene 1: the hook ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out = r(f, B(1) - 20, B(1), p4in); // cut the curve: accelerate left into the next scene
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `translateX(${-out * 230}px)`, opacity: 1 - r(f, B(1) - 20, B(1) - 8, Easing.linear) }}>
      <div style={{ width: 1300 }}><BeatWords text="Stop retyping your address" start={6} size={132} /></div>
    </AbsoluteFill>
  );
};

/* ---------- scene 2: save a snippet ---------- */
const ADD = 'rec/take-add.mp4';
/* tap times read off the recording's frames: + 3.45, Text Cutling 5.35, name 6.75,
   text field 12.6, Save 19.40 */
const segA: Segment = { src: ADD, from: 0, frames: 164, start: 3.2, rate: 1.5 };
const segB: Segment = { src: ADD, from: 164, frames: 140, start: 8.2, rate: 3.0 };
const segC: Segment = { src: ADD, from: 304, frames: 52, start: 19.1, rate: 1.6 };
const addTaps: ScreenTap[] = [
  { at: at(segA, 3.45) / FPS, u: 0.636, v: 0.088 },
  { at: at(segA, 5.35) / FPS, u: 0.636, v: 0.097 },
  { at: at(segA, 6.75) / FPS, u: 0.5, v: 0.211 },
  { at: at(segB, 12.6) / FPS, u: 0.5, v: 0.565 },
  { at: at(segC, 19.4) / FPS, u: 0.902, v: 0.109 },
];
const Save: React.FC = () => {
  const f = useCurrentFrame();
  const len = B(4) - B(1);
  /* enters mid-flight from the right, swings from a steep angle to face camera, then drifts */
  const enter = r(f, 0, 50, p4out);
  const rig: Rig = (g) => ({
    x: mix(enter, 150, 62) - r(g, 60, len, easeIO) * 10,
    y: -2,
    z: mix(r(g, 0, 70), -120, 0) + r(g, len - 30, len, p4in) * 360, // pushes into camera at the end (zoom-through)
    rx: mix(enter, 0.18, 0.04),
    ry: mix(enter, -0.95, -0.22) + r(g, 80, len - 30, easeIO) * 0.12,
    rz: mix(enter, 0.06, 0.012),
  });
  const saveAt = at(segC, 19.4);
  return (
    <AbsoluteFill>
      <PhoneShot rig={rig} segments={[segA, segB, segC]} taps={addTaps} blur={(g) => r(g, len - 16, len, p4in) * 12} />
      <AbsoluteFill style={{ justifyContent: 'center', paddingLeft: 170, opacity: 1 - r(f, len - 20, len - 6, Easing.linear) }}>
        <div style={{ width: 640 }}>
          <BeatWords text="Save it once" start={Math.round(saveAt) - 2 * BEAT} size={104} align="left" />
          <div style={{ marginTop: 26, fontFamily: FONT, fontSize: 36, fontWeight: 500, color: 'rgba(15,21,18,.55)', opacity: r(f, saveAt + 10, saveAt + 34), transform: `translateY(${(1 - r(f, saveAt + 10, saveAt + 34)) * 18}px)` }}>
            Name it once and it stays
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- scene 3: the card before the drop ---------- */
const Card: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames: len } = useVideoConfig();
  /* zoom-through entry: arrives growing 0.75 -> 1 from 10 px blur; exits accelerating left */
  const inT = r(f, 0, 30, expoOut);
  const out = r(f, len - 22, len, p4in);
  return (
    <AbsoluteFill style={{ background: palette.accent, alignItems: 'center', justifyContent: 'center', transform: `translateX(${-out * 1920}px)` }}>
      <div style={{ transform: `scale(${mix(inT, 0.75, 1)})`, filter: `blur(${(1 - inT) * 10}px)` }}>
        <BeatWords text="Paste it into any app" start={4} size={140} color="#FFFFFF" per={BEAT / 2} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- scene 4: the drop, pasting in Messages ---------- */
const PASTE = 'rec/take-paste.mp4';
const PASTE_AT = 520;
const DROP_IN_SCENE = B(5) - PASTE_AT; // frames from scene start to the drop
const segP: Segment = { src: PASTE, from: 0, frames: 287, start: 8.78 - DROP_IN_SCENE / FPS };
const pasteTaps: ScreenTap[] = [{ at: DROP_IN_SCENE / FPS - 0.05, u: 0.25, v: 0.718 }];
const Paste: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames: len } = useVideoConfig();
  const enter = r(f, 0, 26, p4out); // entry continues the card's leftward exit
  /* at the drop: a camera push onto the text field (slow-fast-slow), held, then the spin out */
  const push = r(f, DROP_IN_SCENE + 6, DROP_IN_SCENE + 70, easeIO);
  const spin = r(f, len - 30, len, p4in);
  const rig: Rig = () => ({
    x: mix(enter, 90, -60) + push * 30,
    y: mix(push, -2, 52),
    z: mix(push, 20, 150),
    rx: mix(push, 0.02, -0.12),
    ry: mix(enter, 0.55, 0.2) - push * 0.1 + spin * Math.PI,
    rz: -0.02,
  });
  const drop = f >= DROP_IN_SCENE;
  return (
    <AbsoluteFill>
      <PhoneShot rig={rig} segments={[segP]} taps={pasteTaps} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-end', paddingRight: 150, opacity: 1 - r(f, len - 26, len - 12, Easing.linear) }}>
        <div style={{ width: 620 }}>
          {drop && <BeatWords text="Straight from the keyboard" start={DROP_IN_SCENE} size={112} align="left" />}
          <div style={{ marginTop: 24, fontFamily: FONT, fontSize: 36, fontWeight: 500, color: 'rgba(15,21,18,.55)', opacity: r(f, DROP_IN_SCENE + 2 * BEAT, DROP_IN_SCENE + 2 * BEAT + 24) }}>
            Works in any app you type in
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- scene 5: icon and colour ---------- */
const ICON = 'rec/take-icon.mp4';
const segI1: Segment = { src: ICON, from: 0, frames: 57, start: 3.35 };
const segI2: Segment = { src: ICON, from: 57, frames: 135, start: 11.2, rate: 1.2 };
const iconTaps: ScreenTap[] = [
  { at: at(segI1, 3.45) / FPS, u: 0.409, v: 0.779 },
  { at: at(segI2, 11.45) / FPS, u: 0.614, v: 0.687 },
  { at: at(segI2, 13.4) / FPS, u: 0.889, v: 0.404 },
];
const Sort: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames: len } = useVideoConfig();
  const spinIn = r(f, 0, 30, p4out); // second half of the spin that ended the last scene
  const pull = r(f, len - 30, len, p4in);
  const rig: Rig = () => ({
    x: mix(spinIn, -40, -70) - pull * 260,
    y: -4 + pull * 10,
    z: mix(spinIn, 60, 0) - pull * 160,
    rx: 0.04,
    ry: (1 - spinIn) * Math.PI + 0.22 - r(f, 40, len, easeIO) * 0.14,
    rz: 0.01,
  });
  return (
    <AbsoluteFill>
      <PhoneShot rig={rig} segments={[segI1, segI2]} taps={iconTaps} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-end', paddingRight: 170, opacity: 1 - r(f, len - 24, len - 10, Easing.linear) }}>
        <div style={{ width: 600 }}><BeatWords text="Find it by colour" start={20} size={108} align="left" /></div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- scene 6: everywhere ---------- */
const Everywhere: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames: len } = useVideoConfig();
  /* each device lands on its own beat: Mac, then iPad, then the iPhone slides back in */
  const mac = r(f, 0, 34, expoOut), pad = r(f, BEAT, BEAT + 34, expoOut), phone = r(f, 2 * BEAT, 2 * BEAT + 40, p4out);
  const fall = r(f, len - 22, len, p4in);
  const drift = r(f, 0, len, Easing.linear);
  return (
    <AbsoluteFill style={{ transform: `translateY(${fall * 420}px)`, opacity: 1 - r(f, len - 12, len, Easing.linear) }}>
      {/* Mac window, centre back */}
      <div style={{ position: 'absolute', left: 960 - 430, top: 120 + (1 - mac) * 90, width: 860, height: 820, opacity: mac, transform: `scale(${0.97 + drift * 0.03})`,
        borderRadius: 26, overflow: 'hidden', boxShadow: '0 50px 110px rgba(0,0,0,.16), 0 0 0 1px rgba(0,0,0,.07)' }}>
        <Img src={staticFile('captures/mac-window.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      {/* iPad, front left */}
      <div style={{ position: 'absolute', left: 250 - (1 - pad) * 140, top: 300, width: 420, opacity: pad, transform: `rotate(${-5 + drift * 1.5}deg)`,
        borderRadius: 34, padding: 13, background: '#111', boxShadow: '0 50px 90px rgba(0,0,0,.24)' }}>
        <Img src={staticFile('captures/02-iPad_Air_13-inch_M4_-02_MainGrid.png')} style={{ width: '100%', display: 'block', borderRadius: 22 }} />
      </div>
      {/* iPhone, front right, in 3D, holding the grid with the new card */}
      <PhoneShot segments={[{ src: ADD, from: 0, frames: len, start: 21.8, rate: 0.01 }]}
        rig={() => ({ x: mix(phone, 170, 92), y: -6 + drift * 4, z: 20, rx: 0.06, ry: mix(phone, -0.9, -0.32) + drift * 0.08, rz: 0.03, s: 0.84 })} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 56 }}>
        <BeatWords text="On iPhone, iPad and Mac" start={3 * BEAT} size={60} per={BEAT / 2} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- scene 7: the end ---------- */
const End: React.FC = () => {
  const f = useCurrentFrame();
  /* icon lands on the downbeat with a squash, the word follows, a held beat, then the CTA */
  const land = r(f, -10, 8, p4in);
  const squash = f < 8 ? 1 : 1 - 0.14 * Math.exp(-(f - 8) / 5) * Math.cos((f - 8) / 3.2);
  const ctaAt = B(12) - B(11);
  const cta = r(f, ctaAt, ctaAt + 22, expoOut);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 }}>
      <Img src={staticFile('icon.png')} style={{ width: 210, height: 210, borderRadius: 47, transform: `translateY(${(1 - land) * -520}px) scale(${1 / Math.sqrt(squash)}, ${squash})`, transformOrigin: 'bottom',
        boxShadow: `0 ${24 * land}px ${60 * land}px rgba(0,0,0,${0.22 * land})` }} />
      <BeatWords text="Cutling" start={BEAT} size={120} />
      <div style={{ opacity: f >= ctaAt ? 1 : 0, transform: `scale(${mix(cta, 0.85, 1)})`, padding: '18px 44px', borderRadius: 999, background: INK, color: '#fff', fontFamily: FONT, fontWeight: 650, fontSize: 38 }}>
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
  const S = { save: B(1), card: B(4), paste: PASTE_AT, cardEnd: 545, sort: B(7), every: B(9), end: B(11) };
  const tapsAbs = [
    ...addTaps.map((t) => S.save + t.at * FPS),
    ...pasteTaps.map((t) => S.paste + t.at * FPS),
    ...iconTaps.map((t) => S.sort + t.at * FPS),
  ];
  return (
    <AbsoluteFill style={{ background: palette.base }}>
      <Background style="mesh" palette={palette} speed={1} />
      <Sequence durationInFrames={S.save}><Hook /></Sequence>
      <Sequence from={S.save} durationInFrames={S.card - S.save}><Save /></Sequence>
      <Sequence from={S.paste} durationInFrames={S.sort - S.paste}><Paste /></Sequence>
      <Sequence from={S.card} durationInFrames={S.cardEnd - S.card}><Card /></Sequence>
      <Sequence from={S.sort} durationInFrames={S.every - S.sort}><Sort /></Sequence>
      <Sequence from={S.every} durationInFrames={S.end - S.every}><Everywhere /></Sequence>
      <Sequence from={S.end} durationInFrames={FILM_FRAMES - S.end}><End /></Sequence>

      {/* music from its 5.46 s downbeat; in over 8 frames, out over the last 1.2 s */}
      <Audio src={staticFile('music/music-132.mp3')} trimBefore={Math.round(5.46 * FPS)}
        volume={(fr) => 0.85 * interpolate(fr, [0, 8, FILM_FRAMES - 72, FILM_FRAMES], [0, 1, 1, 0], clamp)} />
      {/* whooshes peak on each seam */}
      {[S.save, S.card, S.cardEnd, S.sort, S.every].map((s, i) => <Sfx key={i} src={i % 2 ? 'sfx-2627' : 'sfx-1490'} at={s - (i % 2 ? 15 : 42)} vol={0.32} />)}
      {/* a soft click on every tap */}
      {tapsAbs.map((t, i) => <Sfx key={`t${i}`} src="sfx-1109" at={t - 2} vol={0.28} dur={40} />)}
      {/* typing under the typed name and text */}
      <Sfx src="sfx-1386" at={S.save + 168} vol={0.16} dur={132} />
      {/* riser into the drop, the pop of the paste on it */}
      <Sfx src="sfx-1144" at={B(5) - 3 * FPS} from={3.2} vol={0.3} dur={3 * FPS} />
      <Sfx src="sfx-2357" at={B(5)} vol={0.6} dur={30} />
      {/* the icon landing */}
      <Sfx src="sfx-2902" at={S.end - 1.3 * FPS} vol={0.45} dur={4 * FPS} />
    </AbsoluteFill>
  );
};
