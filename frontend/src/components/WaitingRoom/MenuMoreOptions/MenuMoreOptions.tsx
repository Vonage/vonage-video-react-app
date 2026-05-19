import { useCallback, useState } from 'react';
import type { FocusEvent, MouseEvent, ReactElement } from 'react';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import MenuItem from '@mui/material/MenuItem';
import type { MenuItemProps } from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { useTranslation } from 'react-i18next';
import VividIcon from '@ui/VividIcon';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import advancedSettings$ from '@Context/AdvancedSettings';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import useStableRef from '@web/hooks/useStableRef';
import { env } from '../../../env';

export type MenuMoreOptionsWaitingRoomProps = {
  onClose: () => void;
  open: boolean;
  anchorEl: HTMLElement | null;
};

const { open: openAdvancedSettings } = advancedSettings$.actions;

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
  const hasSupportedMediaProcessor = hasMediaProcessorSupport('both');
  const isBackgroundEffectsSupported = hasSupportedMediaProcessor && env.ALLOW_BACKGROUND_EFFECTS;
  const isPrecallNetworkTestSupported = hasSupportedMediaProcessor;
  const unsupportedFeatureTooltipTitle = t('waitingRoom.unsupportedFeature.tooltip');
  const [tooltipAnchorElement, setTooltipAnchorElement] = useState<HTMLElement | null>(null);
  const menuAutoFocusGuard = useStableRef(
    () => {
      const guard = { active: false, timeoutId: -1 };

      if (!open) {
        return guard;
      }

      guard.active = true;
      guard.timeoutId = window.setTimeout(() => {
        guard.active = false;
      }, 0);

      return guard;
    },
    ({ timeoutId }) => window.clearTimeout(timeoutId),
    [open]
  );

  const { open: openBackgroundEffects } = backgroundEffectsDialog$.use.actions();
  const { open: openPrecallNetworkTest } = precallNetworkTestDialog$.use.actions();

  const handleMenuClose = useCallback(() => {
    setTooltipAnchorElement(null);
    onClose();
  }, [onClose]);

  const handleClickAdvancedSettings = useCallback(() => {
    openAdvancedSettings();
    handleMenuClose();
  }, [handleMenuClose]);

  const handleClickBackgroundEffects = useCallback(() => {
    openBackgroundEffects();
    handleMenuClose();
  }, [handleMenuClose, openBackgroundEffects]);

  const handleClickNetworkTest = useCallback(() => {
    openPrecallNetworkTest();
    handleMenuClose();
  }, [handleMenuClose, openPrecallNetworkTest]);

  const handleOpenUnsupportedTooltip = useCallback(
    (event: FocusEvent<HTMLElement> | MouseEvent<HTMLElement>) => {
      if (event.type === 'focus' && menuAutoFocusGuard.current.active) {
        return;
      }

      setTooltipAnchorElement(event.currentTarget);
    },
    [menuAutoFocusGuard]
  );

  const handleCloseUnsupportedTooltip = useCallback(() => {
    setTooltipAnchorElement(null);
  }, []);

  const backgroundEffectsAvailabilityProps: MenuItemProps = isBackgroundEffectsSupported
    ? {
        onClick: handleClickBackgroundEffects,
      }
    : {
        'aria-disabled': true as const,
        className: 'cursor-not-allowed opacity-50',
        onBlur: handleCloseUnsupportedTooltip,
        onFocus: handleOpenUnsupportedTooltip,
        onMouseEnter: handleOpenUnsupportedTooltip,
        onMouseLeave: handleCloseUnsupportedTooltip,
      };

  const precallNetworkTestAvailabilityProps: MenuItemProps = isPrecallNetworkTestSupported
    ? {
        onClick: handleClickNetworkTest,
      }
    : {
        'aria-disabled': true as const,
        className: 'cursor-not-allowed opacity-50',
        onBlur: handleCloseUnsupportedTooltip,
        onFocus: handleOpenUnsupportedTooltip,
        onMouseEnter: handleOpenUnsupportedTooltip,
        onMouseLeave: handleCloseUnsupportedTooltip,
      };

  return (
    <>
      <Menu
        id="menu-more-options"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        slotProps={{ list: { 'aria-labelledby': 'basic-button' } }}
        data-testid="menu-more-options"
      >
        {env.WAITING_ROOM_ALLOW_ADVANCED_SETTINGS && (
          <MenuItem
            onClick={handleClickAdvancedSettings}
            key="advancedSettings-option"
            data-testid="advanced-settings-option"
          >
            <VividIcon name="gear-line" customSize={-6} />
            <span className="ml-2">{t('advancedSettings.title')}</span>
          </MenuItem>
        )}

        <MenuItem key="backgroundEffects-option" {...backgroundEffectsAvailabilityProps}>
          <VividIcon name="gallery-line" customSize={-6} />
          <span className="ml-2">{t('backgroundEffects.title')}</span>
        </MenuItem>
        <MenuItem key="precallNetworkTest-option" {...precallNetworkTestAvailabilityProps}>
          <VividIcon name="cell-reception-line" customSize={-6} />
          <span className="ml-2">{t('waitingRoom.precallNetworkTest.title')}</span>
        </MenuItem>
      </Menu>
      <Popper
        anchorEl={tooltipAnchorElement}
        className="z-1500"
        open={open && tooltipAnchorElement !== null}
        placement="bottom"
      >
        <Paper className="ml-2 rounded-md bg-vera-dark-background px-2 py-1 text-vera-caption text-vera-text-secondary-dark">
          {unsupportedFeatureTooltipTitle}
        </Paper>
      </Popper>
    </>
  );
};

export default MenuMoreOptions;
