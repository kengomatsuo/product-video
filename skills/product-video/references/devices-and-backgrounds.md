# Devices and backgrounds

## The 3D phone (`src/Phone3D.tsx`)

A real three.js iPhone inside `<ThreeCanvas>` (`@remotion/three`), in millimetres
(iPhone 16 Pro: 71.5 x 149.6 x 8.25): the plan outline extruded with a rounded bevel in
brushed titanium, black clearcoat glass, side buttons, Dynamic Island, a soft shadow
thrown on an unseen wall, lit by a `RoomEnvironment` built in code (no HDR download).

| Prop | Meaning |
|---|---|
| `screen.segments` | parts of recordings on the scene timeline: `{ src, from, frames, start, rate }` |
| `screen.image` | a still, when a screen truly holds still |
| `aspect` | the capture's width / height: the screen matches it, nothing is cropped |
| `position`, `rotation`, `scale` | driven per frame by a rig function |
| `taps` | `{ at, u, v }`: a touch dot and ring on the screen surface, pressing 1:2 |

Traps found while building it, all fixed in the file:
- ThreeCanvas draws on frame change. A texture or environment that arrives later needs
  `advance()` while rendering, or the frame keeps the old state (`useRedraw`).
- A material created without a map never shows one added later: remount it (`key`).
- A second WebGL2 context fails in headless Chrome: one shared canvas for painting.
- `Config.setChromiumOpenGlRenderer('angle')` or WebGL2 is missing entirely.
- Touch dots in white vanish on a white UI; the grey of iOS "show touches" reads.

Moves that read as expensive (from the references): enter mid-flight at a steep angle and
swing to face camera; a slow-fast-slow push onto the element that matters; a spin whose
second half starts the next scene; a pull back that reveals more devices. One phone,
continuous, carrying the eye across cuts; the screen cuts between recording segments
while the body keeps moving.

## Backgrounds (`src/backgrounds.tsx`)

| Style | What moves |
|---|---|
| `mesh` | four soft colour fields on independent slow orbits (periods 14-31 s) |
| `watercolor` | two p5.brush plates painted once, drifting at different speeds |
| `shapes` | triangles, rings and pills at different depths, drifting and turning |
| `solid` | the accent, for caption cards |

Every background carries `Dither`, a per-frame noise layer at 2.5%, and the master pass
adds temporal noise: flat light gradients band in 8-bit H.264 otherwise.

## The painter (`src/paint.ts`)

p5.brush (MIT, standalone build, WebGL2) paints each plate once, from a fixed seed, so
every render tab paints the same picture. The WebGL origin is the centre; jobs draw in
top-left coordinates. Colours come from the brand palette.
