import type { ReactElement } from 'react';
import usePreviewPublisherContext from '../../../hooks/usePreviewPublisherContext';
import useVideoStats, { formatResolution, formatFrameRate } from '../../../hooks/useVideoStats';

/**
 * VideoStatsOverlay Component
 *
 * Displays the current video resolution and frame rate as a badge
 * in the upper-left corner of the waiting room video preview.
 * @returns {ReactElement} The VideoStatsOverlay component.
 */
const VideoStatsOverlay = (): ReactElement => {
  const { publisher } = usePreviewPublisherContext();
  const { height, frameRate } = useVideoStats(publisher);

  const resolution = formatResolution(height);
  const frameRateLabel = formatFrameRate(frameRate);
  const label = [resolution, frameRateLabel].filter(Boolean).join(' ') || '–';

  return (
    <div
      data-testid="video-stats-overlay"
      className="rounded bg-black/60 px-2 py-0.5 pointer-events-none"
    >
      <span className="text-white text-[0.7rem] font-medium leading-[1.4] tracking-[0.02em]">
        {label}
      </span>
    </div>
  );
};

export default VideoStatsOverlay;
