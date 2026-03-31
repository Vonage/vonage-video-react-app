import { ReactElement, useCallback } from 'react';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
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
  const hasSupportedMediaProcessor = hasMediaProcessorSupport();
  const isBackgroundEffectsSupported = hasSupportedMediaProcessor && env.ALLOW_BACKGROUND_EFFECTS;
  const isPrecallNetworkTestSupported = hasSupportedMediaProcessor;

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
      <Tooltip
        arrow
        title={isBackgroundEffectsSupported ? '' : t('waitingRoom.unsupportedFeature.tooltip')}
      >
        <div>
          <MenuItem
            disabled={!isBackgroundEffectsSupported}
            onClick={() => {
              if (!isBackgroundEffectsSupported) return;

              handleClickBackgroundEffects();
            }}
            key="backgroundEffects-option"
          >
            <VividIcon name="gallery-line" customSize={-6} />
            <span className="ml-2">{t('backgroundEffects.title')}</span>
          </MenuItem>
        </div>
      </Tooltip>
      <Tooltip
        arrow
        title={isPrecallNetworkTestSupported ? '' : t('waitingRoom.unsupportedFeature.tooltip')}
      >
        <div>
          <MenuItem
            disabled={!isPrecallNetworkTestSupported}
            onClick={() => {
              if (!isPrecallNetworkTestSupported) return;

              handleClickNetworkTest();
            }}
            key="precallNetworkTest-option"
          >
            <VividIcon name="cell-reception-line" customSize={-6} />
            <span className="ml-2">{t('waitingRoom.precallNetworkTest.title')}</span>
          </MenuItem>
        </div>
      </Tooltip>
    </Menu>
  );
};

export default MenuMoreOptions;
