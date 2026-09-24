# Model licenses

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

## iphone.glb — NOT DOWNLOADED (blocked by mandatory login, see report)

Best candidate identified, license-clear, not yet obtained:

- **Model:** "Apple iPhone 15 Pro Black" by **polyman Studio** (@Polyman_3D)
- **Source URL:** https://sketchfab.com/3d-models/apple-iphone-15-pro-black-6fd1283ec05d412d99a3f23b2e80e473
- **License:** CC Attribution (CC-BY) — https://creativecommons.org/licenses/by/4.0/
- **Attribution line to use:** "Apple iPhone 15 Pro Black" by polyman Studio (sketchfab.com/Polyman_3D), licensed CC-BY.
- **Stats (from Sketchfab's own model info panel):** 61.5k triangles, 37.6k vertices. Black titanium finish, Dynamic-Island era, flat sides — matches the brief.
- **Why not downloaded:** Sketchfab requires an authenticated account for every download regardless of license; this session's browser has no logged-in Sketchfab session, and creating an account or entering credentials is outside what I'm permitted to do. See the main report for what to do next.
- **Secondary candidate:** "iPhone 15 Pro" by rtql8d — https://sketchfab.com/3d-models/iphone-15-pro-21a243ccceb64a4da8c0f622dcb935d3 — also CC Attribution, 14.9k triangles / 7.5k vertices (lighter weight, also worth checking for a black-glass front and separate screen mesh once downloaded).

## ipad.glb — NOT DOWNLOADED (blocked by mandatory login, see report)

Best candidate identified, license-clear, not yet obtained:

- **Model:** "Ipad pro13in black m4" by **polyman Studio** (@Polyman_3D)
- **Source URL:** https://sketchfab.com/3d-models/ipad-pro13in-black-m4-32e1748e3b6840108ededf4359112b2f
- **License:** CC Attribution (CC-BY)
- **Attribution line to use:** "Ipad pro13in black m4" by polyman Studio (sketchfab.com/Polyman_3D), licensed CC-BY.
- **Stats:** 136.9k triangles, 87.9k vertices — flat sides, uniform bezels, space-black era iPad Pro M4. Same author/style as the iPhone candidate above, for a visually consistent pair.
- **Why not downloaded:** same Sketchfab login wall as the iPhone model.
- **Rejected candidate:** "Apple iPad Pro" by DatSketch — https://sketchfab.com/3d-models/apple-ipad-pro-e5ffb3c80b2d4d6690249f8ee2bdafbe — license is **CC Attribution-NonCommercial**, not usable in a commercial promo video. Do not use.
- **Rejected source (Free3D):** "IPad Pro 12inches 2019" — free3d.com/3d-model/ipad-pro-12inches-2019-81247.html — listed under Free3D's "Personal Use License" (non-commercial). Do not use. Free3D's other free iPad/iPhone listings are older/silver-bezel devices (iPad Mini, iPad 2, iPhone 6/X/5c) and did not match the modern-black-glass brief even where license was acceptable.
- **Rejected sources (unclear/unstated model license):** the many "JavaScript Mastery iPhone 15 Pro" tutorial clones on GitHub (adrianhajdin/iphone and its many forks) ship an `.glb` whose repo is MIT but whose model asset provenance/license is never stated (assets are just linked via a Google Drive folder) — rejected per the unclear-license rule. Likewise `repalash/threepipe-device-mockup-codrops` (MacBook + iPhone mockup, MIT repo) never documents where its `device-mockup.glb` model came from or its license — rejected for the same reason.
- **Rejected source (GetGLB "iPhone 17 Pro"):** getglb.com/robot/iphone-17-pro/ — vague "Free Standard" license, no textures, and the whole phone is a single mesh/node (fails the "screen must be a separate mesh" requirement) — rejected.

## iphone.glb and ipad.glb: downloaded 2026-09-24 from Sketchfab (owner's logged-in account)

| File | Model | Author | Licence | Attribution line |
|---|---|---|---|---|
| iphone.glb | [Apple iPhone 15 Pro Black](https://sketchfab.com/3d-models/apple-iphone-15-pro-black-6fd1283ec05d412d99a3f23b2e80e473) (GLB, 2k textures, 61.5k triangles) | polyman Studio | CC-BY 4.0 | "Apple iPhone 15 Pro Black" by polyman Studio (sketchfab.com/Polyman_3D), licensed CC-BY 4.0 |
| ipad.glb | [Ipad pro13in black m4](https://sketchfab.com/3d-models/ipad-pro13in-black-m4-32e1748e3b6840108ededf4359112b2f) (GLB, 2k textures, 136.9k triangles) | polyman Studio | CC-BY 4.0 | "Ipad pro13in black m4" by polyman Studio (sketchfab.com/Polyman_3D), licensed CC-BY 4.0 |

Use (`LibraryDevice` in `src/Devices.tsx`): scene units are metres after the node matrices.
iPhone screen material `ZVpJkazCvASOIpG`, faces -z (turned pi on y), texture `flipY` on.
iPad screen material `jcIAFNBmpIebNBE`; the file sets the iPad on a Magic Keyboard at 31
degrees, so only the slab is kept (world box x -0.193..-0.075, y 0.005..0.205) and a basis
stands it upright in portrait; texture `flipY` on. The iPad's shadow plane showed through its
screen, so it renders with `shadow={0}`. Not affiliated with or endorsed by Apple Inc.
