import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import classNames from 'classnames';
import VividIcon from '@ui/components/VividIcon';
import disabledButtonClassName from '../../constants/disabledButtonClassName';
import type { ScheduleStatusKind } from '../../types/ScheduleStatus';
import AutoJoinCheck from '../components/AutoJoinCheck';
import PrepareToJoinCard from '../components/PrepareToJoinCard';
import useScheduleCopy from '../hooks/useScheduleCopy';

const statusIcon: Record<ScheduleStatusKind, string> = {
  unscheduled: 'infinity-line',
  daysAway: 'calendar-line',
  withinDay: 'clock-line',
  withinHour: 'clock-line',
  withinFiveMinutes: 'alarm-line',
  started: 'check-circle-line',
  ended: 'history-line',
};

/**
 * Waiting room variant A: one status line under the meeting name; the Join button keeps its label.
 */
const WaitingCardStatusLine = (): ReactElement => {
  const { t } = useTranslation();
  const { status, statusText, timeRange, joinOpensText, isJoinEnabled, isWaiting } =
    useScheduleCopy();
  const isUrgent = status.kind === 'withinFiveMinutes' || status.kind === 'started';

  return (
    <PrepareToJoinCard>
      <PrepareToJoinCard.Schedule>
        <div className="flex items-start gap-2">
          <VividIcon
            name={statusIcon[status.kind]}
            customSize={-6}
            style={{
              color: isUrgent ? 'var(--vera-text-primary)' : 'var(--vera-text-tertiary)',
              flexShrink: 0,
            }}
          />
          <div className="flex flex-col gap-0.5">
            <span
              className={classNames('font-vera-plain text-vera-body-base-semibold', {
                'text-vera-text-primary': isUrgent,
                'text-vera-text-tertiary': !isUrgent,
              })}
            >
              {statusText}
            </span>
            {timeRange && (
              <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
                {timeRange}
              </span>
            )}
          </div>
        </div>
      </PrepareToJoinCard.Schedule>
      <PrepareToJoinCard.Actions>
        <div className="flex w-full flex-col gap-3">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={!isJoinEnabled}
            className={disabledButtonClassName}
          >
            {t('button.join')}
          </Button>
          {joinOpensText && (
            <span className="text-center font-vera-plain text-vera-caption text-vera-text-tertiary">
              {joinOpensText}
            </span>
          )}
          {isWaiting && <AutoJoinCheck />}
        </div>
      </PrepareToJoinCard.Actions>
    </PrepareToJoinCard>
  );
};

export default WaitingCardStatusLine;
