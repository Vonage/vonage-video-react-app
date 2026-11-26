import type { ReactElement } from 'react';
import { tv } from 'tailwind-variants';
import VividIcon from '@ui/components/VividIcon';
import useMeetingTabCopy from '../../hooks/useMeetingTabCopy';

const meetingTimerPill = tv(
  {
    base: 'flex h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-vera-warning px-4 font-vera-plain text-vera-body-base-semibold text-vera-on-warning tabular-nums max-sm:h-8 max-sm:gap-1.5 max-sm:px-3 max-sm:text-vera-caption-semibold',
  },
  { twMerge: false }
);

/**
 * Static copy of the toolbar meeting timer from #902, shown only in the last five minutes.
 */
const MeetingTimerPill = (): ReactElement => {
  const { timerLabel } = useMeetingTabCopy();

  return (
    <div role="timer" className={meetingTimerPill()}>
      <VividIcon name="clock-line" customSize={-5} style={{ color: 'var(--vera-on-warning)' }} />
      {timerLabel}
    </div>
  );
};

export default MeetingTimerPill;
