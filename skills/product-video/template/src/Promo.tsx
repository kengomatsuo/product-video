import React from 'react';
import { AbsoluteFill, Series, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { Backdrop, EndBeat, IconBeat, ShotBeat, TitleBeat } from './components';
import { cutEntry, cutExit } from './motion';
import { beatFrames, isAppStore, overlapFrames, transitionOf, type Beat, type Storyboard } from './timing';
import brand from './brand.json';

const BeatView: React.FC<{ beat: Beat; appStore: boolean }> = ({ beat, appStore }) => {
  switch (beat.type) {
    case 'title': return <TitleBeat text={beat.text} sub={beat.sub} />;
    case 'shot': return <ShotBeat {...beat} appStore={appStore} />;
    case 'icon': return <IconBeat src={beat.src} name={beat.name} />;
    case 'end': return <EndBeat line={beat.line} cta={beat.cta} icon={(brand as { iconFile?: string }).iconFile} />;
  }
};

/* cut-the-curve shell: the beat's own boundary motion, in the film's one direction (left) */
const CutShell: React.FC<{ len: number; first: boolean; last: boolean; children: React.ReactNode }> = ({ len, first, last, children }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const inn = first ? { x: 0, opacity: 1 } : cutEntry(frame, fps, width);
  const out = last ? { x: 0, opacity: 1 } : cutExit(frame, len, fps, width);
  return <AbsoluteFill style={{ transform: `translateX(${inn.x + out.x}px)`, opacity: inn.opacity * out.opacity }}>{children}</AbsoluteFill>;
};

export const Promo: React.FC<Storyboard> = (s) => {
  const { fps, durationInFrames } = useVideoConfig();
  const appStore = isAppStore(s);
  const kind = transitionOf(s);
  const n = s.beats.length;
  const series = kind === 'dissolve' ? (
    <TransitionSeries>
      {s.beats.flatMap((beat, i) => [
        ...(i > 0 ? [<TransitionSeries.Transition key={`t${i}`} timing={linearTiming({ durationInFrames: overlapFrames(s, fps) })} presentation={fade()} />] : []),
        <TransitionSeries.Sequence key={`b${i}`} durationInFrames={beatFrames(beat, fps)}><BeatView beat={beat} appStore={appStore} /></TransitionSeries.Sequence>,
      ])}
    </TransitionSeries>
  ) : (
    <Series>
      {s.beats.map((beat, i) => {
        const len = beatFrames(beat, fps);
        return (
          <Series.Sequence key={i} durationInFrames={len}>
            {kind === 'cut' ? <CutShell len={len} first={i === 0} last={i === n - 1}><BeatView beat={beat} appStore={appStore} /></CutShell> : <BeatView beat={beat} appStore={appStore} />}
          </Series.Sequence>
        );
      })}
    </Series>
  );
  return (
    <AbsoluteFill>
      {/* opaque stage ground: a mid-motion cut must never show the page behind it [HF seam-craft] */}
      <Backdrop />
      {s.motionBlur ? <CameraMotionBlur shutterAngle={180} samples={8}>{series}</CameraMotionBlur> : series}
      {s.music && (
        <Audio src={staticFile(s.music)} volume={(fr) => (s.musicVolume ?? 0.8) * interpolate(fr, [0, 12, durationInFrames - fps, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
      )}
    </AbsoluteFill>
  );
};
