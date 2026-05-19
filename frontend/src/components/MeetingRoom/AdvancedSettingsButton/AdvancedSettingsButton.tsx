import type { ReactElement } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import advancedSettings$ from '@Context/AdvancedSettings';
import VividIcon from '@ui/VividIcon';
import ToolbarButton from '../ToolbarButton';

export type AdvancedSettingsButtonProps = {
  isOverflowButton?: boolean;
};

const AdvancedSettingsButton = ({
  isOverflowButton = false,
}: AdvancedSettingsButtonProps): ReactElement => {
  const { t } = useTranslation();
  const [isOpen, { open, close }] = advancedSettings$.use(({ isOpen }) => isOpen);

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
            style={{
              color: isOpen ? 'var(--vera-secondary-light)' : 'var(--vera-on-secondary-light)',
            }}
          />
        }
        isOverflowButton={isOverflowButton}
      />
    </Tooltip>
  );
};

export default AdvancedSettingsButton;
