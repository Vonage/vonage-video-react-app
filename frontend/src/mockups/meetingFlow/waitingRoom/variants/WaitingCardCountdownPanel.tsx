import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import classNames from 'classnames';
import disabledButtonClassName from '../../constants/disabledButtonClassName';
import AutoJoinCheck from '../components/AutoJoinCheck';
import PrepareToJoinCard from '../components/PrepareToJoinCard';
import useScheduleCopy from '../hooks/useScheduleCopy';

/**
 * Waiting room variant B: a countdown panel carries the wait; it turns green once the meeting starts.
 */
const WaitingCardCountdownPanel = (): ReactElement => {
  const { t } = useTranslation();
  const { status, statusText, countdownText, timeRange, isJoinEnabled, isWaiting } =
    useScheduleCopy();
  const isStarted = status.kind === 'started';
  const isImminent = status.kind === 'withinFiveMinutes';
  const hasPanel = status.kind !== 'unscheduled';

  return (
    <PrepareToJoinCard>
      {hasPanel && (
        <PrepareToJoinCard.Schedule>
          <div
            className={classNames('flex w-full flex-col gap-1 rounded-vera-large px-4 py-3', {
              'bg-vera-success/10': isStarted,
              'bg-vera-background': !isStarted,
            })}
          >
            {countdownText ? (
              <>
                <span className="font-vera-plain text-vera-caption-semibold uppercase text-vera-text-tertiary">
                  {t('meetingFlow.waitingRoom.countdownLabel')}
                </span>
                <span
                  className={classNames('font-vera-plain text-vera-heading-3 tabular-nums', {
                    'text-vera-text-primary': isImminent,
                    'text-vera-text-secondary': !isImminent,
                  })}
                >
                  {countdownText}
                </span>
                <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
                  {status.kind === 'withinFiveMinutes' || status.kind === 'withinHour'
                    ? timeRange
                    : statusText}
                </span>
              </>
            ) : (
              <>
                <span
                  className={classNames('font-vera-plain text-vera-body-base-semibold', {
                    'text-vera-success': isStarted,
                    'text-vera-text-tertiary': !isStarted,
                  })}
                >
                  {statusText}
                </span>
                {timeRange && (
                  <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
                    {timeRange}
                  </span>
                )}
              </>
            )}
          </div>
        </PrepareToJoinCard.Schedule>
      )}
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
          {isWaiting && <AutoJoinCheck />}
        </div>
      </PrepareToJoinCard.Actions>
    </PrepareToJoinCard>
  );
};

export default WaitingCardCountdownPanel;
