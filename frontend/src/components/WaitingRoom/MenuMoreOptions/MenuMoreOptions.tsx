import { ReactElement, useCallback } from 'react';
import MenuItem from '@ui/MenuItem';
import Menu from '@ui/Menu';
import { useTranslation } from 'react-i18next';
import VividIcon from '@components/VividIcon';
import Box from '@ui/Box';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import useAppConfig from '@Context/AppConfig/hooks/useAppConfig';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';

export type MenuMoreOptionsWaitingRoomProps = {
  onClose: () => void;
  open: boolean;
  anchorEl: HTMLElement | null;
};

/**
 * MenuMoreOptions Component
 *
 * Displays a list of options in the waiting room.
 * @param {MenuMoreOptionsWaitingRoomProps} props - The props for the component.
 *  @property {Function} onClose - Menu close handler.
 *  @property {boolean} open - Whether the menu is open or not.
 *  @property {HTMLElement | null} anchorEl - The anchor element.
 * @returns {ReactElement} - The MenuMoreOptions component
 */
const MenuMoreOptions = ({
  onClose,
  open,
  anchorEl,
}: MenuMoreOptionsWaitingRoomProps): ReactElement => {
  const { t } = useTranslation();
  const { open: openBackgroundEffects } = backgroundEffectsDialog$.use.actions();
  const allowBackgroundEffects = useAppConfig(
    ({ videoSettings }) => videoSettings.allowBackgroundEffects
  );
  const shouldDisplayBackgroundEffects = hasMediaProcessorSupport() && allowBackgroundEffects;

  const handleClick = useCallback(() => {
    openBackgroundEffects();
    onClose();
  }, [openBackgroundEffects, onClose]);

  return (
    <Menu
      id="menu-more-options"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      MenuListProps={{ 'aria-labelledby': 'basic-button' }}
      data-testid="menu-more-options"
    >
      {shouldDisplayBackgroundEffects && (
        <MenuItem
          onClick={() => {
            handleClick();
          }}
          key="backgroundEffects-option"
        >
          <VividIcon name="gallery-line" customSize={-6} />
          <Box sx={{ ml: 1 }}>{t('backgroundEffects.title')}</Box>
        </MenuItem>
      )}
    </Menu>
  );
};

export default MenuMoreOptions;
