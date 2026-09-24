## macbook.glb — DONE, downloaded and verified

- **Source:** https://www.npmjs.com/package/rigged-macbook-3d (npm/unpkg, no login wall) — package repo https://github.com/william-laverty/rigged-macbook-3d
- **Underlying 3D model:** "MacBook Pro M3 16-inch 2024" by **jackbaeten** on Sketchfab — https://sketchfab.com/3d-models/macbook-pro-m3-16-inch-2024-8e34fc2b303144f78490007d91ff57c4
- **License:** CC-BY 4.0 (https://creativecommons.org/licenses/by/4.0/) on the model; the npm package wrapper (rig script, component code) is MIT (William Laverty, 2026).
- **Attribution line to use in credits/about screen:**
  > "MacBook Pro M3 16-inch 2024" by jackbaeten (sketchfab.com/jackbaeten), licensed CC-BY 4.0. Rig by William Laverty (rigged-macbook-3d, MIT).
- **Modifications from original:** recolored to Space Black, lid split from base at the hinge seam, lid reparented under a `LidPivot` hinge node, screen isolated as its own mesh, meshopt-compressed. (Per package's own CREDITS.md.)
- **Trademark note:** not affiliated with or endorsed by Apple Inc.; "MacBook" used nominatively.

### Inspection results (via three.js GLTFLoader + MeshoptDecoder, bun script)

- **Compression:** meshopt (EXT_meshopt_compression) — decoder must be registered on the loader (`loader.setMeshoptDecoder(MeshoptDecoder)`) or parsing throws.
- **File size:** 965 KB (well under the 30 MB budget).
- **Total triangles:** 112,625 across 29 nodes.
- **Bounding box (model units, root `Sketchfab_Scene`):** x = 35.48, y = 23.78, z = 33.67. (Consistent with a 16" MacBook Pro modeled in cm, in its resting/open pose — the lid's own offset already tilts it back, see below.)
- **Node hierarchy (relevant nodes):**
  ```
  Sketchfab_Scene
    Base (Group)               — chassis/keyboard/trackpad meshes: BaseMesh, BaseMesh_1..16
    LidPivot (Object3D)        — HINGE PIVOT, local pos (0, -0.50, -12.20) relative to root
      LidHolder (Object3D)     — local pos (0, 0.50, 12.20) — re-centers back to the pivot's origin
        Lid (Group)            — local pos (0, 10.98, -16.56)
          LidMesh, LidMesh_1..5  — lid shell/bezel meshes (multiple materials, incl. PaletteMaterial001/002, lmWQsEjxpsebDlK, nDsMUuDKliqGFdU, CRQixVLpahJzhJc, JvMFZolVCdpPqjj)
          Screen (Mesh)         — SCREEN MESH, its own material `sfCQkHOWyrsLmor`, 94 triangles
  ```
- **Screen mesh:** node name `Screen`, material name `sfCQkHOWyrsLmor` (single-purpose, not shared with any body part — safe to swap for a video texture). UV range: U 0.0066–0.9934, V 0.0066–0.9934 — i.e. it already fills essentially the full 0–1 UV square, so a `VideoTexture` can be applied directly with `texture.flipY = false` (three.js glTF convention) and no extra UV remapping.
- **Lid hinge:** node `LidPivot`. Rotation axis is **local X** (`pivot.rotation.x`). Confirmed both empirically (children pre-offset in +Y/-Z, i.e. screen already tilted back) and from the package's own compiled source (`dist/index.js`): `LID = { OPEN_X: 0, CLOSED_X: 1.94 }` (radians ≈ 111°), and `pivot.rotation.x = closedX + (openX - closedX) * openAmount` where `openAmount` is 0 (closed) → 1 (open). **The glb ships in the fully-open pose (rotation.x = 0)** — to animate opening from closed, start `LidPivot.rotation.x` at `1.94` and animate to `0`.
- **Materials:** 19 distinct material slots total (chassis split into many palette/PBR materials for individual parts — trackpad, keys, ports, logo, hinge, screen, etc.). None are shared between `Screen` and any chassis mesh.
- **Scale note:** model units read as centimeters (bounding box ≈ 35.5 × 23.8 × 33.7, matching a real 16" MacBook Pro's ~35.6 cm width). Scale by `0.01` if the three.js scene is meant to be in meters.

---

