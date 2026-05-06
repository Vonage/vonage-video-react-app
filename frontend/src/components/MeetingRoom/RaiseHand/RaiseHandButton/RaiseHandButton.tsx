import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import useSessionContext from '@hooks/useSessionContext';
import { useIsHandRaisedFor } from '@core/stores';
import emojiMap from '../../../../utils/emojis';

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
        'flex w-full items-center justify-center gap-1.5 rounded border px-3 py-2 text-sm transition-colors',
        localHandIsRaised
          ? 'border-vera-primary bg-vera-primary text-vera-on-primary hover:bg-vera-primary-hover'
          : 'border-transparent bg-transparent text-vera-on-dark-grey hover:bg-vera-dark-grey-hover'
      )}
    >
      <span aria-hidden="true" className="shrink-0 text-xl leading-none">
        {emojiMap.RAISED_HAND}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
};

export default RaiseHandButton;
