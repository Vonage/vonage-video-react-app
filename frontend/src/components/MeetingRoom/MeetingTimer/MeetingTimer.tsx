import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import VividIcon from '@ui/components/VividIcon';
import { isNotNil } from '@common/assertions';
import type { ScheduleWindow } from '@common/types';
import formatMinutesAndSeconds from '@utils/formatMinutesAndSeconds';
import ExtendPopover, { useExtendPopoverOpenState, useMeetingExtension } from './ExtendPopover';
import useEndOfMeetingWarning from './hooks/useEndOfMeetingWarning';
import useMeetingSecondsLeft from './hooks/useMeetingSecondsLeft';
import meetingTimerVariants from './meetingTimerVariants';

/**
 * Time left in the last five minutes of a scheduled meeting.
 * It opens the extend popover on click, and by itself unless the extension limit is reached.
 */
export type MeetingTimerProps = {
  scheduleWindow: ScheduleWindow;
  isCompact?: boolean;
};

const MeetingTimer = ({ scheduleWindow, isCompact = false }: MeetingTimerProps): ReactElement => {
  const { t } = useTranslation();
  const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(null);
  const secondsLeft = useMeetingSecondsLeft({ scheduleWindow });
  const extension = useMeetingExtension();

  useEndOfMeetingWarning({ endsAt: scheduleWindow.endsAt });

  const hasEnded = secondsLeft === 0;
  const isExtensionAvailable = isNotNil(extension) && !extension.isAtLimit;
  const { isOpen, setIsOpen } = useExtendPopoverOpenState({
    endsAt: scheduleWindow.endsAt,
    shouldOpenByItself: !hasEnded && isExtensionAvailable,
  });
  const shouldShowPopover = isOpen && !hasEnded && isNotNil(extension);
  const timeLeftText = t('meetingTimer.timeLeft', {
    timeLeft: formatMinutesAndSeconds({ totalSeconds: secondsLeft, t }),
  });

  return (
    <>
      <button
        ref={setAnchorElement}
        type="button"
        aria-label={timeLeftText}
        aria-haspopup="dialog"
        aria-expanded={shouldShowPopover}
        onClick={() => setIsOpen(!isOpen)}
        className={meetingTimerVariants({ isCompact })}
      >
        <VividIcon
          name={extension?.isAtLimit ? 'lock-line' : 'add-time-line'}
          customSize={isCompact ? -6 : -5}
          style={{ color: 'var(--vera-on-warning)' }}
        />
        <span role="timer">{timeLeftText}</span>
      </button>
      {shouldShowPopover && (
        <ExtendPopover
          anchorElement={anchorElement}
          placement={isCompact ? 'bottom-end' : 'top'}
          scheduleWindow={scheduleWindow}
          extension={extension}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default MeetingTimer;
