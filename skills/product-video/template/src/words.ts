import { syllable } from 'syllable';

/* words at speaking pace: 6.19 syllables a second, 0.2 s more after punctuation */
const SYLLABLES_PER_S = 6.19;

/* frame offsets at which each word starts, as if the line were spoken */
export const speechOnsets = (text: string, fps: number) => {
  let t = 0;
  return text.split(' ').map((w) => {
    const at = t;
    t += syllable(w) / SYLLABLES_PER_S + (/[,.;:]$/.test(w) ? 0.2 : 0);
    return Math.round(at * fps);
  });
};
