/* Pure timing maths, shared by the video and the bun tools. No React here. */

export type Preset = 'landscape' | 'vertical' | 'square' | 'appstore-iphone' | 'appstore-ipad' | 'appstore-mac';

export const PRESETS: Record<Preset, { width: number; height: number; fps: number; note: string }> = {
  landscape: { width: 1920, height: 1080, fps: 60, note: 'site hero, YouTube, X' },
  vertical: { width: 1080, height: 1920, fps: 60, note: 'Reels, Shorts, TikTok, Stories' },
  square: { width: 1080, height: 1080, fps: 60, note: 'feeds, LinkedIn' },
  /* Apple: 15-30 s, max 30 fps, H.264 10-12 Mbps, stereo AAC 256 kbps */
  'appstore-iphone': { width: 886, height: 1920, fps: 30, note: 'App Store preview, every iPhone size' },
  'appstore-ipad': { width: 1200, height: 1600, fps: 30, note: 'App Store preview, iPad 13"' },
  'appstore-mac': { width: 1920, height: 1080, fps: 30, note: 'Mac App Store preview, landscape only' },
};

export type Device = 'iphone' | 'ipad' | 'mac' | 'browser' | 'none';
/* x, y are fractions of the screen; at is seconds into the beat */
export type Tap = { at: number; x: number; y: number };
export type CursorKey = { at: number; x: number; y: number; click?: boolean };

export type Beat =
  | { type: 'title'; seconds: number; text: string; sub?: string }
  | { type: 'shot'; seconds: number; src: string; device: Device; aspect?: number; caption?: string; sub?: string;
      zoom?: { to: number; x: number; y: number; at?: number }; taps?: Tap[]; cursor?: CursorKey[]; trimBefore?: number }
  | { type: 'icon'; seconds: number; src: string; name?: string }
  | { type: 'end'; seconds: number; line: string; cta?: string };

/*
 * transition: 'cut' is cut-the-curve, velocity matched, zero overlap (the default);
 * 'dissolve' overlaps beats (App Store previews, which Apple asks to use dissolves and fades).
 */
export type Storyboard = {
  slug: string;
  preset: Preset;
  beats: Beat[];
  transition?: 'cut' | 'dissolve' | 'none';
  music?: string;
  musicVolume?: number;
  motionBlur?: boolean;
};

export const isAppStore = (s: Storyboard) => s.preset.startsWith('appstore');
export const transitionOf = (s: Storyboard) => s.transition ?? (isAppStore(s) ? 'dissolve' : 'cut');
export const beatFrames = (b: Beat, fps: number) => Math.round(b.seconds * fps);

/* only a dissolve overlaps beats; a cut has one side on screen per frame */
export const overlapFrames = (s: Storyboard, fps: number) => (transitionOf(s) === 'dissolve' ? Math.round(0.33 * fps) : 0);

export function totalFrames(s: Storyboard, fps = PRESETS[s.preset].fps) {
  const sum = s.beats.reduce((n, b) => n + beatFrames(b, fps), 0);
  return sum - overlapFrames(s, fps) * (s.beats.length - 1);
}

/* the window around each boundary where motion is deliberate (for the pop check) */
export const boundaryFrames = (s: Storyboard, fps: number) => Math.max(overlapFrames(s, fps), Math.round(0.4 * fps));

/* where each beat starts and its middle, in output frames */
export function beatStarts(s: Storyboard, fps = PRESETS[s.preset].fps) {
  const t = overlapFrames(s, fps);
  let at = 0;
  return s.beats.map((b) => {
    const len = beatFrames(b, fps);
    const start = at;
    at += len - t;
    return { start, mid: start + Math.floor(len / 2), end: start + len - 1, type: b.type };
  });
}
