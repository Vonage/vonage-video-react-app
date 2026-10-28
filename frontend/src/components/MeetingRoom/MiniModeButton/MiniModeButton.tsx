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
 * Toolbar control that opens and closes Mini Mode (Document Picture-in-Picture).
 */
const MiniModeButton = ({ isOverflowButton, handleClick }: MiniModeButtonProps): ReactElement => {
  const { t } = useTranslation();
  const { isOpen, enter, exit } = useMiniMode();

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
      aria-label={isOpen ? t('miniMode.expand.ariaLabel') : t('miniMode.enter.ariaLabel')}
    >
      <ToolbarButton
        onClick={onClick}
        isOverflowButton={isOverflowButton}
        data-testid="mini-mode-button"
        icon={
          <VividIcon name="export-solid" customSize={-5} className="text-vera-on-secondary-light" />
        }
      />
    </Tooltip>
  );
};

export default MiniModeButton;
