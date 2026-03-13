import { ReactElement, useCallback } from 'react';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { useTranslation } from 'react-i18next';
import VividIcon from '@components/VividIcon';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import { env } from '../../../env';

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
  const shouldDisplayBackgroundEffects = hasMediaProcessorSupport() && env.ALLOW_BACKGROUND_EFFECTS;
  const { open: openBackgroundEffects } = backgroundEffectsDialog$.use.actions();
  const { open: openPrecallNetworkTest } = precallNetworkTestDialog$.use.actions();

  const handleClickBackgroundEffects = useCallback(() => {
    openBackgroundEffects();
    onClose();
  }, [openBackgroundEffects, onClose]);

  const handleClickNetworkTest = useCallback(() => {
    openPrecallNetworkTest();
    onClose();
  }, [openPrecallNetworkTest, onClose]);

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
            handleClickBackgroundEffects();
          }}
          key="backgroundEffects-option"
        >
          <VividIcon name="gallery-line" customSize={-6} />
          <span className="ml-2">{t('backgroundEffects.title')}</span>
        </MenuItem>
      )}
      <MenuItem
        onClick={() => {
          handleClickNetworkTest();
        }}
        key="precallNetworkTest-option"
      >
        <VividIcon name="cell-reception-line" customSize={-6} />
        <span className="ml-2">{t('waitingRoom.precallNetworkTest.title')}</span>
      </MenuItem>
    </Menu>
  );
};

export default MenuMoreOptions;
