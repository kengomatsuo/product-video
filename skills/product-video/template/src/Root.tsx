import React from 'react';
import { Composition, type CalculateMetadataFunction } from 'remotion';
import { Promo } from './Promo';
import { PRESETS, totalFrames, type Storyboard } from './timing';
import { fontsReady } from './theme';
import storyboard from './storyboard.json';

/* --props can swap the preset: bun tools/render.ts --preset vertical */
const metadata: CalculateMetadataFunction<Storyboard> = async ({ props }) => {
  await fontsReady;
  const p = PRESETS[props.preset];
  return { width: p.width, height: p.height, fps: p.fps, durationInFrames: totalFrames(props, p.fps), props };
};

export const Root: React.FC = () => (
  <Composition
    id="Promo"
    component={Promo}
    defaultProps={storyboard as Storyboard}
    calculateMetadata={metadata}
    width={1920}
    height={1080}
    fps={60}
    durationInFrames={60}
  />
);
