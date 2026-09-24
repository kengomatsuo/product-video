import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Sequence, continueRender, delayRender, staticFile, useVideoConfig } from 'remotion';
import { Video } from '@remotion/media';
import { TapDot, useImageTexture, useRedraw, useVideoCanvas, type ScreenSrc, type ScreenTap } from './Phone3D';

/*
 * MacBook Pro 16-inch (2024) by jackbaeten, CC-BY 4.0, rigged by William Laverty
 * (rigged-macbook-3d, MIT). See public/models/LICENSES.md. Model units are cm.
 * `Screen` has its own material and 0-1 UVs; `LidPivot` hinges on local X,
 * 1.94 rad closed, 0 open.
 */
const LID_CLOSED = 1.94;
const SCREEN_ASPECT = 3456 / 2234; // the 16-inch panel

export function useGltf(src: string) {
  const redraw = useRedraw();
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [handle] = useState(() => delayRender(`model ${src}`));
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(staticFile(src), (g) => { setScene(g.scene); continueRender(handle); });
  }, [src]);
  useEffect(() => { if (scene) redraw(); }, [scene]);
  return scene;
}

/* the capture cropped to the panel's aspect, so the UI keeps its proportions */
function useScreenTexture(src: string, aspect: number) {
  const redraw = useRedraw();
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender(`screen ${src}`));
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      const cw = Math.min(w, h * aspect), ch = cw / aspect;
      const c = document.createElement('canvas');
      c.width = Math.round(cw); c.height = Math.round(ch);
      c.getContext('2d')!.drawImage(img, (w - cw) / 2, (h - ch) / 2, cw, ch, 0, 0, c.width, c.height);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; // this model's screen UVs want flipY on
      setTex(t); continueRender(handle);
    };
    img.src = staticFile(src);
  }, [src]);
  useEffect(() => { if (tex) redraw(); }, [tex]);
  return tex;
}

/* in millimetres like the phone; `open` 0 = closed, 1 = open */
export const MacBook: React.FC<{ screen: string; open: number; position: [number, number, number]; rotation: [number, number, number]; scale: number }> = ({ screen, open, position, rotation, scale }) => {
  const gltf = useGltf('models/macbook.glb');
  const tex = useScreenTexture(screen, SCREEN_ASPECT);
  const model = useMemo(() => {
    if (!gltf || !tex) return null;
    const m = gltf.clone(true);
    m.getObjectByName('Screen')!.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    });
    /* centre it on the hinge line so the rig positions the whole laptop */
    const box = new THREE.Box3().setFromObject(m);
    const c = box.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -c.y, -c.z);
    return m;
  }, [gltf, tex]);
  if (!model) return null;
  const pivot = model.getObjectByName('LidPivot');
  if (pivot) pivot.rotation.x = LID_CLOSED * (1 - open);
  return (
    <group position={position} rotation={rotation} scale={scale * 10}>
      <primitive object={model} />
    </group>
  );
};

/* ---------- library iPhone and iPad (polyman Studio, CC-BY 4.0) ---------- */

type Kind = 'iphone' | 'ipad';
/* orient: model -> upright, screen facing +z, portrait. unit: scene units (metres) -> mm */
const LIB: Record<Kind, { src: string; screenMat: string; unit: number; flipY: boolean; orient: () => THREE.Matrix4; keep?: (b: THREE.Box3) => boolean }> = {
  iphone: { src: 'models/iphone.glb', screenMat: 'ZVpJkazCvASOIpG', unit: 1000, flipY: true, orient: () => new THREE.Matrix4().makeRotationY(Math.PI) },
  ipad: {
    src: 'models/ipad.glb', screenMat: 'jcIAFNBmpIebNBE', unit: 1000, flipY: true,
    /* the file sits the iPad on a Magic Keyboard, tilted 31 degrees: keep the slab, stand it up */
    keep: (b) => b.min.x > -0.193 && b.max.x < -0.075 && b.min.y > 0.005 && b.max.y < 0.205,
    orient: () => {
      const u = new THREE.Vector3(-0.114, 0.19, 0).normalize(), l = new THREE.Vector3(0, 0, 1), n = new THREE.Vector3().crossVectors(u, l);
      return new THREE.Matrix4().makeBasis(u, l, n).invert();
    },
  },
};

export const LibraryDevice: React.FC<{
  kind: Kind; screen: ScreenSrc; position?: [number, number, number]; rotation?: [number, number, number]; scale?: number;
  taps?: ScreenTap[]; frame?: number; fps?: number; shadow?: number;
}> = ({ kind, screen, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, taps = [], frame = 0, fps = 60, shadow = 0.3 }) => {
  const spec = LIB[kind];
  const gltf = useGltf(spec.src);
  const { fps: vfps } = useVideoConfig();
  const [w, h] = screen.size ?? [1320, 2868];
  const video = useVideoCanvas(w, h);
  const image = useImageTexture(screen.image ?? 'icon.png');
  const tex = screen.segments ? video.texture : image;
  const built = useMemo(() => {
    if (!gltf || !tex) return null;
    tex.flipY = spec.flipY; tex.needsUpdate = true;
    const m = gltf.clone(true);
    m.updateMatrixWorld(true);
    let screenMesh: THREE.Mesh | null = null;
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (spec.keep && !spec.keep(new THREE.Box3().setFromObject(mesh))) mesh.visible = false;
      if ((mesh.material as THREE.Material).name === spec.screenMat) {
        mesh.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
        screenMesh = mesh;
      }
    });
    const wrap = new THREE.Group();
    wrap.add(m);
    wrap.applyMatrix4(spec.orient());
    wrap.scale.multiplyScalar(spec.unit);
    wrap.updateMatrixWorld(true);
    /* centre on the screen so taps and rigs work in screen coordinates */
    const sb = new THREE.Box3().setFromObject(screenMesh!);
    const c = sb.getCenter(new THREE.Vector3()), size = sb.getSize(new THREE.Vector3());
    const holder = new THREE.Group();
    holder.add(wrap);
    wrap.position.sub(new THREE.Vector3(c.x, c.y, sb.max.z)); // screen surface at z = 0
    /* the shadow sits a fixed gap behind the measured back, whatever the model's depth */
    holder.updateMatrixWorld(true);
    const body = new THREE.Box3();
    holder.traverse((o) => { if ((o as THREE.Mesh).isMesh && o.visible) body.expandByObject(o); });
    return { holder, sw: size.x, sh: size.y, front: 0, back: body.min.z };
  }, [gltf, tex]);
  return (
    /* the shadow follows the device but never turns with it: a plane that turns shows edge-on */
    <group position={position} scale={scale}>
    {built && shadow > 0 && <ShadowPlane w={built.sw} h={built.sh} z={built.back - 40} opacity={shadow} />}
    <group rotation={rotation}>
      {screen.segments?.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.frames} layout="none">
          <Video src={staticFile(s.src)} onVideoFrame={video.onFrame} muted headless trimBefore={Math.round(s.start * vfps)} playbackRate={s.rate ?? 1} />
        </Sequence>
      ))}
      {built && <primitive object={built.holder} />}
      {built && taps.map((tp, i) => <TapDot key={i} tap={tp} frame={frame} fps={fps} x={(tp.u - 0.5) * built.sw} y={(0.5 - tp.v) * built.sh} z={built.front + 0.1} size={built.sw} />)}
    </group>
    </group>
  );
};

const ShadowPlane: React.FC<{ w: number; h: number; z: number; opacity: number }> = ({ w, h, z, opacity }) => {
  const t = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const x = c.getContext('2d')!;
    const g = x.createRadialGradient(256, 256, 0, 256, 256, 250);
    g.addColorStop(0, 'rgba(0,0,0,0.9)'); g.addColorStop(0.45, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh position={[w * 0.08, -h * 0.09, z]} scale={[1.25, 1.1, 1]}>
      <planeGeometry args={[w * 1.6, h * 1.35]} />
      <meshBasicMaterial map={t} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
};
