import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import VividIcon from '@ui/components/VividIcon';
import ToolbarButton from '../ToolbarButton';
import { raiseHand$ } from '@core/stores';
import useSessionContext from '../../../hooks/useSessionContext';
import { env } from '../../../env';

export type RaiseHandButtonProps = {
  isOverflowButton?: boolean;
};

/**
 * RaiseHandButton — a button (inside the emoji panel) that toggles
 * the local participant's raise-hand state.
 *
 * - Shows "raised" visual state when the local connection's hand is raised.
 * - Calls `raiseHand()` / `lowerHand()` from SessionContext on click.
 * - Gated on `env.ALLOW_RAISE_HAND`.
 * @param props - Component props.
 * @param props.isOverflowButton - Whether the button lives in the overflow menu.
 * @returns The button element, or `false` when the feature is disabled.
 */
const RaiseHandButton = ({
  isOverflowButton = false,
}: RaiseHandButtonProps): ReactElement | false => {
  const { t } = useTranslation();
  const { vonageVideoClient, raiseHand, lowerHand } = useSessionContext();
  const localConnectionId = vonageVideoClient?.connectionId ?? '';
  const isHandRaised = raiseHand$.useIsHandRaised(localConnectionId);

  if (!env.ALLOW_RAISE_HAND) return false;

  const handleClick = () => {
    if (isHandRaised) {
      lowerHand();
    } else {
      raiseHand();
    }
  };

  return (
    <ToolbarButton
      data-testid="raise-hand-button"
      onClick={handleClick}
      isOverflowButton={isOverflowButton}
      title={isHandRaised ? t('raiseHand.lowerHand') : t('raiseHand.toggle')}
      aria-label={t('raiseHand.ariaLabel')}
      icon={
        <VividIcon
          name="hand-solid"
          customSize={-5}
          style={{
            color: isHandRaised ? 'var(--vera-secondary-light)' : 'var(--vera-on-secondary-light)',
          }}
        />
      }
    />
  );
};

export default RaiseHandButton;
