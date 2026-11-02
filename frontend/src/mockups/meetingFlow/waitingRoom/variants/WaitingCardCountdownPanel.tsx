import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import classNames from 'classnames';
import disabledButtonClassName from '../../constants/disabledButtonClassName';
import AutoJoinCheck from '../components/AutoJoinCheck';
import PrepareToJoinCard from '../components/PrepareToJoinCard';
import useScheduleCopy from '../hooks/useScheduleCopy';

/**
 * Waiting room variant B: a countdown panel makes the wait the main message; it turns green once the meeting starts.
 */
const WaitingCardCountdownPanel = (): ReactElement => {
  const { t } = useTranslation();
  const { status, statusText, countdownText, timeRange, isJoinEnabled, isWaiting } =
    useScheduleCopy();
  const isStarted = status.kind === 'started';
  const hasPanel = status.kind !== 'unscheduled';

  return (
    <PrepareToJoinCard>
      {hasPanel && (
        <div
          className={classNames('flex w-full flex-col gap-1 rounded-vera-large px-4 py-4', {
            'bg-vera-success/10': isStarted,
            'bg-vera-background': !isStarted,
          })}
        >
          {countdownText ? (
            <>
              <span className="font-vera-plain text-vera-caption-semibold uppercase text-vera-text-tertiary">
                {t('meetingFlow.waitingRoom.countdownLabel')}
              </span>
              <span className="font-vera-plain text-vera-heading-2 tabular-nums text-vera-text-primary">
                {countdownText}
              </span>
              <span className="font-vera-plain text-vera-body-base text-vera-text-secondary">
                {status.kind === 'withinFiveMinutes' || status.kind === 'withinHour'
                  ? timeRange
                  : statusText}
              </span>
            </>
          ) : (
            <>
              <span
                className={classNames('font-vera-plain text-vera-body-extended-semibold', {
                  'text-vera-success': isStarted,
                  'text-vera-text-secondary': !isStarted,
                })}
              >
                {statusText}
              </span>
              {timeRange && (
                <span className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
                  {timeRange}
                </span>
              )}
            </>
          )}
          {isWaiting && (
            <div className="pt-2">
              <AutoJoinCheck />
            </div>
          )}
        </div>
      )}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={!isJoinEnabled}
        className={disabledButtonClassName}
      >
        {t('button.join')}
      </Button>
    </PrepareToJoinCard>
  );
};

export default WaitingCardCountdownPanel;
