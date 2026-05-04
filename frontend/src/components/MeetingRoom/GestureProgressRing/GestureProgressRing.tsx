import { ReactElement } from 'react';
import type { GestureName } from '../../../hooks/useGestureDetection';
import { GESTURE_EMOJI_MAP } from '../../../hooks/useGestureDetection';

export type GestureProgressRingProps = {
  /** Which gesture is being detected. */
  gesture: GestureName;
  /** Whether the gesture is being detected or has completed. */
  state: 'detecting' | 'completed';
  /** Total duration (ms) for the ring fill animation. */
  durationMs: number;
  /** Width of the containing tile in pixels, used for proportional sizing. */
  tileWidth: number;
};

const RING_STROKE_WIDTH = 4;

/**
 * Circular progress ring shown over the publisher tile while a gesture is
 * being held. `pathLength={1}` lets a single CSS keyframe animate the fill
 * regardless of the circle's actual circumference.
 */
const GestureProgressRing = ({
  gesture,
  state,
  durationMs,
  tileWidth,
}: GestureProgressRingProps): ReactElement => {
  const size = Math.max(Math.round(tileWidth * 0.2), 64);
  const radius = (size - RING_STROKE_WIDTH) / 2;

  const isCompleted = state === 'completed';

  return (
    <div
      data-testid="gesture-progress-ring"
      className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none animate-gesture-ring-in"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className="stroke-vera-on-dark-grey/30"
            strokeWidth={RING_STROKE_WIDTH}
            pathLength={1}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className="stroke-vera-on-dark-grey"
            strokeWidth={RING_STROKE_WIDTH}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={isCompleted ? 0 : undefined}
            style={
              isCompleted
                ? undefined
                : {
                    animation: `gesture-ring-fill ${durationMs}ms linear forwards`,
                  }
            }
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center select-none drop-shadow-[0_1px_3px_var(--vera-dark-grey-opacity)]"
          style={{ fontSize: size * 0.5 }}
          role="img"
          aria-hidden="true"
        >
          {GESTURE_EMOJI_MAP[gesture]}
        </span>
      </div>
    </div>
  );
};

export default GestureProgressRing;
