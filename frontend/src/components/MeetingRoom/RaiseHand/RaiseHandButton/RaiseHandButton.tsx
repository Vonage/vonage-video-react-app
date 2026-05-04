import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import useSessionContext from '@hooks/useSessionContext';

/**
 * Toggles the local user's raised-hand state. Rendered inside the Reactions
 * (Emoji) panel.
 */
const RaiseHandButton = (): ReactElement => {
  const { t } = useTranslation();
  const { localHandIsRaised, raiseHand, lowerHand } = useSessionContext();

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
      className={[
        'flex w-full items-center justify-center gap-1.5 rounded px-3 py-2 text-sm',
        'border transition-colors',
        localHandIsRaised
          ? 'border-vera-primary bg-vera-primary text-vera-on-primary hover:bg-vera-primary-hover'
          : 'border-transparent bg-transparent text-vera-on-dark-grey hover:bg-vera-dark-grey-hover',
      ].join(' ')}
    >
      <span aria-hidden="true" className="shrink-0 text-xl leading-none">
        ✋
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
};

export default RaiseHandButton;
