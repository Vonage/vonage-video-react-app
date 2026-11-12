import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { isNil } from '@common/assertions';
import useScheduleCopy from '../../hooks/useScheduleCopy';
import type { ScheduledStatus } from '../../types/ScheduleStatus';
import SplitPanel from '@ui/layout/SplitPanel';
import classNames from 'classnames';

export const scheduleCountdownPanelTestIds = {
  root: 'schedule-countdown-panel',
} as const;

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

  return (
    <SplitPanel data-testid={scheduleCountdownPanelTestIds.root} className={className} {...props}>
      <SplitPanel.Left>
        {!isNil(countdownText) && (
          <>
            <span className="font-vera-plain text-vera-caption-semibold uppercase text-vera-text-tertiary">
              {t('waitingRoom.schedule.startsIn')}
            </span>
            <span
              role="timer"
              className={classNames('font-vera-plain text-vera-heading-3 tabular-nums', {
                'text-vera-text-primary': isImminent,
                'text-vera-text-secondary': !isImminent,
              })}
            >
              {countdownText}
            </span>
          </>
        )}

        {!isNil(headlineText) && (
          <span
            className={classNames('font-vera-plain text-vera-body-base-semibold', {
              'text-vera-success': isStarted,
              'text-vera-text-tertiary': !isStarted,
            })}
          >
            {headlineText}
          </span>
        )}
      </SplitPanel.Left>

      <SplitPanel.Right>
        <span className="font-vera-plain text-vera-caption-semibold uppercase text-vera-text-tertiary">
          {dayText}
        </span>
        <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
          {startTimeText}
        </span>
        <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
          {endTimeText}
        </span>
      </SplitPanel.Right>
    </SplitPanel>
  );
};

export default ScheduleCountdownPanel;
