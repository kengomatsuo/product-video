import React, { useEffect, useMemo, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Video } from '@remotion/media';
import { Sequence, continueRender, delayRender, staticFile, useRemotionEnvironment, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/*
 * An iPhone in real 3D, in millimetres (iPhone 16 Pro: 71.5 x 149.6 x 8.25).
 * Body: the plan outline extruded with a rounded bevel, brushed titanium.
 * Front: black glass with clearcoat; screen: the capture at its own aspect, unlit so
 * UI colours stay exact; Dynamic Island on top. Lit by a room environment built in code.
 */
export type Body = { w: number; h: number; d: number; r: number };
export const IPHONE: Body = { w: 71.5, h: 149.6, d: 8.25, r: 11.5 };
/* iPad Air 13-inch (M4), apple.com/ipad-air/specs: 214.9 x 280.6 x 6.1 */
export const IPAD: Body = { w: 214.9, h: 280.6, d: 6.1, r: 18 };

export function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/* ShapeGeometry UVs are in shape units; map them to 0..1 so a texture fills the shape */
export function shapeGeo(w: number, h: number, r: number) {
  const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 24);
  const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  return g;
}

/* ThreeCanvas draws on frame change; anything that arrives later must ask for a redraw */
export function useRedraw() {
  const { advance, invalidate } = useThree();
  const { isRendering } = useRemotionEnvironment();
  return () => (isRendering ? advance(performance.now()) : invalidate());
}

export const StudioLight: React.FC = () => {
  const { gl, scene } = useThree();
  const redraw = useRedraw();
  const [handle] = useState(() => delayRender('studio light'));
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.15;
    redraw();
    continueRender(handle);
    return () => { env.dispose(); pm.dispose(); };
  }, [gl, scene]);
  return (
    <>
      <directionalLight position={[-160, 260, 320]} intensity={2.2} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[220, -120, 180]} intensity={0.5} color="#dfe8ff" />
    </>
  );
};

/* image capture as a texture; the render waits for it */
export function useImageTexture(src: string) {
  const redraw = useRedraw();
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => { if (tex) redraw(); }, [tex]);
  const [handle] = useState(() => delayRender(`texture ${src}`));
  useEffect(() => {
    /* decode, then copy into a canvas: a plain image texture stayed black in headless renders */
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d')!.drawImage(img, 0, 0);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true;
      setTex(t); continueRender(handle);
    };
    img.src = staticFile(src);
  }, [src]);
  return tex;
}

/* video capture: @remotion/media decodes each exact frame, we copy it into a canvas texture */
export function useVideoCanvas(w: number, h: number) {
  const { advance, invalidate } = useThree();
  const { isRendering } = useRemotionEnvironment();
  const [c] = useState(() => {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return { canvas, ctx: canvas.getContext('2d')!, t };
  });
  const onFrame = (f: CanvasImageSource) => {
    c.ctx.drawImage(f, 0, 0, w, h);
    c.t.needsUpdate = true;
    if (isRendering) advance(performance.now()); else invalidate();
  };
  return { texture: c.t, onFrame };
}

/* A segment plays part of a recording on the screen: from/frames are on the scene's
   timeline, start is seconds into the recording, rate its speed. */
export type Segment = { src: string; from: number; frames: number; start: number; rate?: number };
export type ScreenSrc = { image?: string; video?: string; trimBefore?: number; size?: [number, number]; segments?: Segment[] };

const ScreenMaterial: React.FC<{ src: ScreenSrc }> = ({ src }) => {
  if (src.video || src.segments) return <VideoScreen src={src} />;
  return <ImageScreen image={src.image!} />;
};
const ImageScreen: React.FC<{ image: string }> = ({ image }) => {
  const t = useImageTexture(image);
  /* a new material when the map arrives: three.js compiles the map path only at creation */
  return t ? <meshBasicMaterial key="tex" map={t} toneMapped={false} /> : <meshBasicMaterial key="none" color="#000" />;
};
const VideoScreen: React.FC<{ src: ScreenSrc }> = ({ src }) => {
  const { fps } = useVideoConfig();
  const [w, h] = src.size ?? [1320, 2868];
  const { texture, onFrame } = useVideoCanvas(w, h);
  return (
    <>
      {src.segments
        ? src.segments.map((s, i) => (
            <Sequence key={i} from={s.from} durationInFrames={s.frames} layout="none">
              <Video src={staticFile(s.src)} onVideoFrame={onFrame} muted headless trimBefore={Math.round(s.start * fps)} playbackRate={s.rate ?? 1} />
            </Sequence>
          ))
        : <Video src={staticFile(src.video!)} onVideoFrame={onFrame} muted headless trimBefore={src.trimBefore} />}
      <meshBasicMaterial map={texture} toneMapped={false} />
    </>
  );
};

export const Phone3D: React.FC<{
  screen: ScreenSrc; aspect: number; position?: [number, number, number]; rotation?: [number, number, number];
  scale?: number; color?: string; shadow?: number; taps?: ScreenTap[]; frame?: number; fps?: number; children?: React.ReactNode;
  body?: Body; tablet?: boolean;
}> = ({ screen, aspect, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, color = '#8f9296', shadow = 0.35, taps = [], frame = 0, fps = 60, children, body: BODY = IPHONE, tablet = false }) => {
  const bevel = Math.min(1.1, BODY.d * 0.15);
  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(BODY.w - bevel * 2, BODY.h - bevel * 2, BODY.r - bevel), {
      depth: BODY.d - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 8, curveSegments: 32,
    });
    g.translate(0, 0, -(BODY.d - bevel * 2) / 2);
    return g;
  }, [BODY]);
  /* the screen keeps the capture's aspect: nothing of the UI is cropped */
  const inset = tablet ? 15 : 4.3;
  const sh = BODY.h - inset, sw = Math.min(sh * aspect, BODY.w - inset);
  const screenH = sw / aspect;
  /* the front is black glass to the very edge: the metal band shows only at an angle */
  const glass = useMemo(() => shapeGeo(BODY.w - 0.3, BODY.h - 0.3, BODY.r - 0.15), [BODY]);
  const disp = useMemo(() => shapeGeo(sw, screenH, tablet ? 12 : BODY.r - 2.4), [sw, screenH]);
  const island = useMemo(() => shapeGeo(sw * 0.31, sw * 0.092, sw * 0.046), [sw]);
  const back = useMemo(() => shapeGeo(BODY.w - 1.6, BODY.h - 1.6, BODY.r - 0.8), [BODY]);
  const front = BODY.d / 2;
  const shadowTex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const x = c.getContext('2d')!;
    const g = x.createRadialGradient(256, 256, 0, 256, 256, 250);
    g.addColorStop(0, 'rgba(0,0,0,0.9)'); g.addColorStop(0.45, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(c);
  }, []);
  const titanium = <meshPhysicalMaterial color={color} metalness={1} roughness={0.32} clearcoat={0.4} clearcoatRoughness={0.2} />;
  /* extrude groups: 0 = the flat caps (black like the glass), 1 = the sides and bevel (metal) */
  const bodyMats = useMemo(() => [
    new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.4, metalness: 0, envMapIntensity: 0.2 }),
    new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness: 0.32, clearcoat: 0.4, clearcoatRoughness: 0.2 }),
  ], [color]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* soft shadow thrown on an unseen wall behind the phone */}
      {shadow > 0 && (
        <mesh position={[6, -14, -46]} scale={[1.25, 1.1, 1]}>
          <planeGeometry args={[BODY.w * 1.6, BODY.h * 1.35]} />
          <meshBasicMaterial map={shadowTex} transparent opacity={shadow} depthWrite={false} />
        </mesh>
      )}
      <mesh geometry={body} material={bodyMats} />
      {/* side buttons: action + volume on the left, power on the right */}
      {!tablet && [[-1, 38, 7], [-1, 22, 11], [-1, 8, 11], [1, 24, 16]].map(([side, y, len], i) => (
        <mesh key={i} position={[side * (BODY.w / 2 + 0.35), y, 0]}>
          <boxGeometry args={[0.9, len, 3.2]} />{titanium}
        </mesh>
      ))}
      <mesh geometry={back} position={[0, 0, -front - 0.02]} rotation={[0, Math.PI, 0]}>
        <meshPhysicalMaterial color="#5c5f62" roughness={0.55} metalness={0.2} clearcoat={0.6} />
      </mesh>
      <mesh geometry={glass} position={[0, 0, front + 0.02]}>
        {/* glass reflects the room faintly; at full strength it read as a silver frame */}
        <meshPhysicalMaterial color="#020202" roughness={0.18} metalness={0} clearcoat={0.5} clearcoatRoughness={0.15} envMapIntensity={0.18} />
      </mesh>
      <mesh geometry={disp} position={[0, 0, front + 0.05]}><ScreenMaterial src={screen} /></mesh>
      {!tablet && <mesh geometry={island} position={[0, screenH / 2 - sw * 0.092 / 2 - screenH * 0.012, front + 0.07]}>
        <meshBasicMaterial color="#000" />
      </mesh>}
      {taps.map((tp, i) => <TapDot key={i} tap={tp} frame={frame} fps={fps} x={(tp.u - 0.5) * sw} y={(0.5 - tp.v) * screenH} z={front + 0.08} size={sw} />)}
      {children}
    </group>
  );
};

/* where a finger touched the recording: u, v are 0..1 across the screen; at is in seconds */
export type ScreenTap = { at: number; u: number; v: number };

const ease = (x: number) => Math.min(1, Math.max(0, x));
/* press 1:2 (compress 0.1 s, release 0.22 s), ring spreads and fades over 0.5 s */
export const TapDot: React.FC<{ tap: ScreenTap; frame: number; fps: number; x: number; y: number; z: number; size: number }> = ({ tap, frame, fps, x, y, z, size }) => {
  const t = frame / fps - tap.at;
  if (t < -0.12 || t > 0.6) return null;
  const press = t < 0 ? 1 - Math.pow(ease((t + 0.1) / 0.1), 2) * 0.16 : 0.84 + (1 - Math.pow(1 - ease(t / 0.22), 3)) * 0.16;
  const ring = ease(t / 0.5), fade = 1 - Math.pow(ring, 1.4);
  const r = size * 0.1; // about a fingertip on a real phone
  return (
    /* drawn over the screen, never depth-tested against it: 0.03 mm apart they z-fight */
    <group position={[x, y, z + 0.4]} renderOrder={10}>
      <mesh scale={press} renderOrder={10}>
        <circleGeometry args={[r, 48]} />
        <meshBasicMaterial color="#3a3a3c" transparent opacity={0.34 * (t < 0.3 ? 1 : fade)} depthWrite={false} depthTest={false} toneMapped={false} />
      </mesh>
      {t >= 0 && (
        <mesh scale={0.6 + ring * 1.1} renderOrder={11}>
          <ringGeometry args={[r * 1.05, r * 1.22, 64]} />
          <meshBasicMaterial color="#3a3a3c" transparent opacity={0.55 * fade} depthWrite={false} depthTest={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};
