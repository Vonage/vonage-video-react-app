import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import useSessionContext from '@hooks/useSessionContext';

/**
 * RaiseHandButton Component
 *
 * A full-width labelled button rendered inside the Reactions (Emoji) panel.
 * Toggles the local user's raised-hand state. Label and aria-label swap between
 * "Raise hand" and "Lower hand" to reflect the current state.
 *
 * Active state (hand raised) uses the VERA primary highlight token so the
 * participant has clear visual confirmation their hand is up.
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
