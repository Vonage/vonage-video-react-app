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
  const { countdownText, headlineText, detailText } = useScheduleCopy(scheduleStatus);

  const isStarted = scheduleStatus.kind === 'started';
  const isImminent = scheduleStatus.kind === 'withinFiveMinutes';
  const { panel, countdown, headline } = scheduleCountdownPanelVariants({ isStarted, isImminent });

  return (
    <div data-testid="schedule-countdown-panel" className={panel({ className })} {...props}>
      {!isNil(countdownText) && (
        <>
          <span className="font-vera-plain text-vera-caption-semibold uppercase text-vera-text-tertiary">
            {t('waitingRoom.schedule.startsIn')}
          </span>
          <span role="timer" className={countdown()}>
            {countdownText}
          </span>
        </>
      )}

      {!isNil(headlineText) && <span className={headline()}>{headlineText}</span>}

      {!isNil(detailText) && (
        <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
          {detailText}
        </span>
      )}
    </div>
  );
};

export default ScheduleCountdownPanel;
