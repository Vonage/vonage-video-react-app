import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { tv } from 'tailwind-variants';
import VividIcon from '@ui/components/VividIcon';
import meetingExtension$ from '../../context/meetingExtensionContext';
import useExtensionCopy from '../../hooks/useExtensionCopy';

const timerButton = tv(
  {
    base: 'flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 font-vera-plain text-vera-body-base-semibold tabular-nums transition-colors',
    variants: {
      tone: {
        calm: 'bg-vera-dark-grey text-vera-on-dark-grey hover:bg-vera-dark-grey-hover',
        urgent: 'bg-vera-warning text-vera-on-warning',
      },
    },
  },
  { twMerge: false }
);

/**
 * Entry point of variant C: a moderator-only timer in the toolbar; it turns amber in the last minutes.
 */
const ExtensionTimerButton = (): ReactElement => {
  const { t } = useTranslation();
  const { countdown, isAtCap, isEndingSoon: isUrgent } = useExtensionCopy();
  const isOpen = meetingExtension$.use.select((state) => state.isOpen);
  const { setOpen } = meetingExtension$.use.actions();

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-label={t('meetingFlow.extension.extendMeeting')}
      onClick={() => setOpen(!isOpen)}
      className={timerButton({ tone: isUrgent ? 'urgent' : 'calm' })}
    >
      <VividIcon
        name={isAtCap ? 'lock-line' : 'add-time-line'}
        customSize={-5}
        style={{ color: isUrgent ? 'var(--vera-on-warning)' : 'var(--vera-on-dark-grey)' }}
      />
      {t('meetingFlow.extension.timeLeft', { countdown })}
    </button>
  );
};

export default ExtensionTimerButton;
