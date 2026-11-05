import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import { tv } from 'tailwind-variants';
import VividIcon from '@ui/components/VividIcon';
import GoToLandingPageButton from '@components/GoodBye/GoToLandingPageButton';
import disabledButtonClassName from '../../constants/disabledButtonClassName';
import formatMeetingDate from '../../helpers/formatMeetingDate';
import useLocale from '../../hooks/useLocale';
import AutoJoinCheck from '../components/AutoJoinCheck';
import PrepareToJoinCard from '../components/PrepareToJoinCard';
import useScheduleCopy from '../hooks/useScheduleCopy';

const statusChip = tv(
  {
    base: 'inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 font-vera-plain text-vera-caption-semibold',
    variants: {
      tone: {
        neutral: 'bg-vera-background text-vera-text-tertiary',
        live: 'bg-vera-success/10 text-vera-success',
        ended: 'bg-vera-disabled text-vera-text-tertiary',
      },
    },
  },
  { twMerge: false }
);

/**
 * Waiting room variant C: a status chip plus a Join button whose label carries the countdown.
 */
const WaitingCardButtonState = (): ReactElement => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { status, statusText, joinLabel, isJoinEnabled, isWaiting } = useScheduleCopy();

  const chip = (() => {
    if (status.kind === 'unscheduled') return null;
    if (status.kind === 'started') {
      return {
        tone: 'live' as const,
        icon: 'broadcast-line',
        label: t('meetingFlow.waitingRoom.liveNow'),
      };
    }
    if (status.kind === 'ended') {
      return {
        tone: 'ended' as const,
        icon: 'history-line',
        label: t('meetingFlow.waitingRoom.endedChip'),
      };
    }
    const startLabel = formatMeetingDate({ date: status.startsAt, locale, format: 'dateTime' });
    return {
      tone: 'neutral' as const,
      icon: status.isRecurring ? 'reload-line' : 'calendar-line',
      label: `${t('meetingFlow.waitingRoom.scheduled')} · ${startLabel}`,
    };
  })();

  const extraStatusText =
    status.kind === 'ended' || (status.kind !== 'unscheduled' && isWaiting && status.isRecurring)
      ? statusText
      : null;

  return (
    <PrepareToJoinCard>
      {chip && (
        <PrepareToJoinCard.Schedule>
          <div className="flex w-full flex-col gap-1.5">
            <span className={statusChip({ tone: chip.tone })}>
              <VividIcon name={chip.icon} customSize={-6} style={{ color: 'currentColor' }} />
              {chip.label}
            </span>
            {extraStatusText && (
              <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
                {extraStatusText}
              </span>
            )}
          </div>
        </PrepareToJoinCard.Schedule>
      )}
      <PrepareToJoinCard.Actions>
        <div className="flex w-full flex-col gap-3">
          {status.kind === 'ended' ? (
            <GoToLandingPageButton />
          ) : (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={!isJoinEnabled}
              className={`tabular-nums ${disabledButtonClassName}`}
            >
              {joinLabel}
            </Button>
          )}
          {isWaiting && <AutoJoinCheck />}
        </div>
      </PrepareToJoinCard.Actions>
    </PrepareToJoinCard>
  );
};

export default WaitingCardButtonState;
