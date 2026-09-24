import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { continueRender, delayRender, staticFile } from 'remotion';
import { useRedraw } from './Phone3D';

/*
 * MacBook Pro 16-inch (2024) by jackbaeten, CC-BY 4.0, rigged by William Laverty
 * (rigged-macbook-3d, MIT). See public/models/LICENSES.md. Model units are cm.
 * `Screen` has its own material and 0-1 UVs; `LidPivot` hinges on local X,
 * 1.94 rad closed, 0 open.
 */
const LID_CLOSED = 1.94;
const SCREEN_ASPECT = 3456 / 2234; // the 16-inch panel

function useGltf(src: string) {
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
