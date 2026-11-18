/* the camera the explainer films use: target (mm), distance (mm), azimuth and elevation (rad), vertical fov (deg) */
export type Cam = { tx: number; ty: number; tz: number; d: number; az: number; el: number; fov: number };

/* The box YouTube Shorts, TikTok and Instagram Reels all leave clear on a 1080 x 1920 frame, read from each platform's own overlay file
   (product-video references/formats.md, "Vertical safe zone"): x 120-887 from y 288 to 840, x 120-780 from y 840 to 1247.
   The vertical cut keeps every word, press and result inside it; the phone and the ground may run under the overlays. */
export const SAFE = { left: 120, right: 887, rightLow: 780, top: 288, step: 840, bottom: 1247 };
export const inSafe = (x: number, y: number) => y >= SAFE.top && y <= SAFE.bottom && x >= SAFE.left && x <= (y > SAFE.step ? SAFE.rightLow : SAFE.right);

/* where things go inside it: the headline from its top (above the step, so the full width), the subtitle on its floor (below the step, so
   left of the button column), and the picture's action between the two, on the subtitle's axis */
export const VERTICAL = {
  headline: { top: SAFE.top + 14, left: SAFE.left + 12, right: SAFE.right - 12 },
  subtitle: { bottom: SAFE.bottom - 12, left: SAFE.left + 10, right: SAFE.rightLow - 10 },
  action: { top: 470, bottom: 1160, left: SAFE.left + 10, right: SAFE.rightLow - 10 },
};
/* a frame point as AbsoluteFill padding that centres its content between `left` and `right` */
export const between = (left: number, right: number, W = 1080) => ({ paddingLeft: left, paddingRight: W - right });

/* the camera that puts a world rectangle (mm on the plane z = 0, seen at `base`'s angles) in the action area, as large as fits */
export function frameRegion(base: Cam, r: { x0: number; x1: number; y0: number; y1: number }, W = 1080, H = 1920): Cam {
  const a = VERTICAL.action;
  const k = Math.min((a.bottom - a.top) / Math.abs(r.y1 - r.y0), (a.right - a.left) / Math.abs(r.x1 - r.x0));
  const d = H / (2 * k * Math.tan(((base.fov / 2) * Math.PI) / 180));
  const cx = (r.x0 + r.x1) / 2, cy = (r.y0 + r.y1) / 2;
  return { ...base, d, tx: cx - ((a.left + a.right) / 2 - W / 2) / k, ty: cy + ((a.top + a.bottom) / 2 - H / 2) / k };
}
