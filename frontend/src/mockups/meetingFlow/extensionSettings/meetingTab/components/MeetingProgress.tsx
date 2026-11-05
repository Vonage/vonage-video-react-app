import type { ReactElement } from 'react';
import useMeetingTabCopy from '../../hooks/useMeetingTabCopy';

/**
 * A bar from the start to the current end, filled up to now, with the time left under it.
 */
const MeetingProgress = (): ReactElement => {
  const { startLabel, endsAtLabel, elapsedPercent, timeLeftLabel } = useMeetingTabCopy();

  return (
    <div className="flex flex-col gap-2">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(elapsedPercent)}
        aria-valuetext={timeLeftLabel}
        className="h-2 w-full overflow-hidden rounded-full bg-vera-background"
      >
        <div
          className="h-full rounded-full bg-vera-primary"
          style={{ width: `${elapsedPercent}%` }}
        />
      </div>
      <div className="flex justify-between font-vera-plain text-vera-caption tabular-nums text-vera-text-tertiary">
        <span>{startLabel}</span>
        <span>{endsAtLabel}</span>
      </div>
      <p className="font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
        {timeLeftLabel}
      </p>
    </div>
  );
};

export default MeetingProgress;
