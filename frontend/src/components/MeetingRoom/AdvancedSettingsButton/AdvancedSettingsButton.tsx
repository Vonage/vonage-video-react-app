import type { ReactElement } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import useTheme from '@ui/theme';
import advancedSettingsDialog$ from '@Context/AdvancedSettingsDialog';
import VividIcon from '@components/VividIcon';
import ToolbarButton from '../ToolbarButton';

export type AdvancedSettingsButtonProps = {
  isOverflowButton?: boolean;
};

const AdvancedSettingsButton = ({
  isOverflowButton = false,
}: AdvancedSettingsButtonProps): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [{ isOpen }, { open, close }] = advancedSettingsDialog$.use();

  const handleClick = () => {
    if (isOpen) {
      close();
      return;
    }

    open();
  };

  return (
    <Tooltip
      title={isOpen ? t('advancedSettings.close') : t('advancedSettings.open')}
      aria-label={t('advancedSettings.ariaLabel')}
    >
      <ToolbarButton
        data-testid="advanced-settings-button"
        sx={{
          marginTop: '0px',
          marginRight: '12px',
        }}
        onClick={handleClick}
        icon={
          <VividIcon
            name="gear-solid"
            customSize={-5}
            sx={{ color: isOpen ? theme.colors.secondary : theme.colors.onSecondary }}
          />
        }
        isOverflowButton={isOverflowButton}
      />
    </Tooltip>
  );
};

export default AdvancedSettingsButton;
