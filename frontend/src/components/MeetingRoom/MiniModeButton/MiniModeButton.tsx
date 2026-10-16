import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import VividIcon from '@ui/components/VividIcon';
import ToolbarButton from '../ToolbarButton';
import { useMiniMode } from '../../../Context/MiniMode';

export type MiniModeButtonProps = {
  isOverflowButton?: boolean;
  handleClick?: () => void;
};

/**
 * Simplified toolbar control for Mini Mode (Document Picture-in-Picture).
 * Hidden when the API is missing or ALLOW_MINI_MODE is false.
 */
const MiniModeButton = ({
  isOverflowButton,
  handleClick,
}: MiniModeButtonProps): ReactElement | false => {
  const { t } = useTranslation();
  const { isSupported, isOpen, enter, exit } = useMiniMode();

  if (!isSupported) {
    return false;
  }

  const onClick = () => {
    if (isOpen) {
      exit();
    } else {
      void enter();
    }
    handleClick?.();
  };

  return (
    <Tooltip
      title={isOpen ? t('miniMode.expand.tooltip') : t('miniMode.enter.tooltip')}
      aria-label={t('miniMode.enter.ariaLabel')}
    >
      <ToolbarButton
        onClick={onClick}
        isOverflowButton={isOverflowButton}
        data-testid="mini-mode-button"
        icon={
          <VividIcon
            name="export-solid"
            customSize={-5}
            style={{ color: 'var(--vera-on-secondary-light)' }}
          />
        }
      />
    </Tooltip>
  );
};

export default MiniModeButton;
