import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import useSessionContext from '@hooks/useSessionContext';
import { useIsHandRaisedFor } from '@core/stores';
import { RAISED_HAND_EMOJI } from '../../../../utils/emojis';

/**
 * Toggles the local user's raised-hand state. Rendered inside the Reactions
 * (Emoji) panel.
 */
const RaiseHandButton = (): ReactElement => {
  const { t } = useTranslation();
  const { raiseHand, lowerHand, getConnectionId } = useSessionContext();
  const localHandIsRaised = useIsHandRaisedFor(getConnectionId());

  const handleClick = () => {
    if (localHandIsRaised) {
      lowerHand();
    } else {
      raiseHand();
    }
  };

  const label = localHandIsRaised ? t('raiseHand.button.lower') : t('raiseHand.button.raise');

  return (
    <button
      type="button"
      data-testid="raise-hand-button"
      onClick={handleClick}
      aria-label={label}
      aria-pressed={localHandIsRaised}
      className={twMerge(
        'flex w-full items-center justify-center gap-1.5 rounded border px-3 py-2 text-vera-body-base transition-colors',
        localHandIsRaised
          ? 'border-vera-primary bg-vera-primary text-vera-on-primary hover:bg-vera-primary-hover'
          : 'border-transparent bg-transparent text-vera-on-dark-grey hover:bg-vera-dark-grey-hover'
      )}
    >
      <span aria-hidden="true" className="shrink-0 text-vera-heading-4 leading-none">
        {RAISED_HAND_EMOJI}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
};

export default RaiseHandButton;
