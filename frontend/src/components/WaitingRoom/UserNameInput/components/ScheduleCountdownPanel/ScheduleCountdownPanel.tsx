import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { isNil } from '@common/assertions';
import useScheduleCopy from '../../hooks/useScheduleCopy';
import type { ScheduledStatus } from '../../types/ScheduleStatus';
import scheduleCountdownPanelVariants from './scheduleCountdownPanelVariants';

export type ScheduleCountdownPanelProps = ComponentProps<'div'> & {
  scheduleStatus: ScheduledStatus;
};

const ScheduleCountdownPanel = ({
  scheduleStatus,
  className,
  ...props
}: ScheduleCountdownPanelProps): ReactElement => {
  const { t } = useTranslation();
  const { countdownText, headlineText, dayText, startTimeText, endTimeText } =
    useScheduleCopy(scheduleStatus);

  const isStarted = scheduleStatus.kind === 'started';
  const isImminent = scheduleStatus.kind === 'withinFiveMinutes';
  const { panel, column, divider, label, countdown, headline, startTime, endTime } =
    scheduleCountdownPanelVariants({ isStarted, isImminent });

  return (
    <div data-testid="schedule-countdown-panel" className={panel({ className })} {...props}>
      <div className={column()}>
        {!isNil(countdownText) && (
          <>
            <span className={label()}>{t('waitingRoom.schedule.startsIn')}</span>
            <span role="timer" className={countdown()}>
              {countdownText}
            </span>
          </>
        )}

        {!isNil(headlineText) && <span className={headline()}>{headlineText}</span>}
      </div>

      <span aria-hidden="true" className={divider()} />

      <div className={column()}>
        <span className={label()}>{dayText}</span>
        <span className={startTime()}>{startTimeText}</span>
        <span className={endTime()}>{endTimeText}</span>
      </div>
    </div>
  );
};

export default ScheduleCountdownPanel;
