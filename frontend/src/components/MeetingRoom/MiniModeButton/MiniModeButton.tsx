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
 * Toolbar control that opens or closes Mini Mode (Document Picture-in-Picture).
 * Hidden when the API is missing or ALLOW_MINI_MODE is false.
 * @param {MiniModeButtonProps} props - Overflow placement and optional close handler
 * @returns {ReactElement | false} The toolbar button, or false when unsupported
 */
const MiniModeButton = ({
  isOverflowButton = false,
  handleClick,
}: MiniModeButtonProps): ReactElement | false => {
  const { t } = useTranslation();
  const { isSupported, isOpen, enter, exit } = useMiniMode();

  if (!isSupported) {
    return false;
  }

  const title = isOpen ? t('miniMode.expand.tooltip') : t('miniMode.enter.tooltip');

  const onClick = () => {
    if (isOpen) {
      exit();
    } else {
      void enter();
    }
    handleClick?.();
  };

  return (
    <Tooltip title={title} aria-label={t('miniMode.enter.ariaLabel')}>
      <ToolbarButton
        onClick={onClick}
        data-testid="mini-mode-button"
        isOverflowButton={isOverflowButton}
        icon={
          <VividIcon
            // picture-in-picture-solid does not exist in the Vivid v4.11.0 icon set;
            // export-solid is the standard "pop out" icon
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
