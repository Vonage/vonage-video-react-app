import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import useSessionContext from '../../../hooks/useSessionContext';
import ToolbarButton from '../ToolbarButton';
import Tooltip from '@mui/material/Tooltip';
import VividIcon from '@components/VividIcon';
import useTheme from '@ui/theme';

export type LayoutButtonProps = {
  isScreenSharePresent: boolean;
  isPinningPresent: boolean;
  isOverflowButton?: boolean;
  onLayoutModeChange?: () => void;
};

/**
 * LayoutButton Component
 *
 * Displays a button to toggle the meeting room layout for the user between `grid` and `active-speaker`.
 * @param {LayoutButtonProps} props - the props for the component.
 *  @property {boolean} isScreenSharePresent - Indicates whether there is a screenshare currently in the session.
 *  @property {boolean} isPinningPresent - Indicates whether there is a participant currently pinned.
 *  @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 * @returns {ReactElement} The LayoutButton component.
 */
const LayoutButton = ({
  isScreenSharePresent,
  isPinningPresent,
  isOverflowButton = false,
  onLayoutModeChange,
}: LayoutButtonProps): ReactElement => {
  const { t } = useTranslation();
  const { layoutMode, setLayoutMode } = useSessionContext();
  const isGrid = layoutMode === 'grid';
  const isDisabled = isScreenSharePresent || isPinningPresent;
  const theme = useTheme();
  const handleClick = () => {
    if (isDisabled) {
      return;
    }

    setLayoutMode((prev) => (prev === 'grid' ? 'active-speaker' : 'grid'));
    onLayoutModeChange?.();
  };

  const getTooltipTitle = () => {
    if (isScreenSharePresent) {
      return t('layout.tooltip.isScreenSharePresent');
    }
    if (isPinningPresent) {
      return t('layout.tooltip.isPinningPresent');
    }
    return isGrid ? t('layout.tooltip.switchToActiveSpeaker') : t('layout.tooltip.switchToGrid');
  };

  return (
    <Tooltip title={getTooltipTitle()} aria-label={t('recording.tooltip.ariaLabel')}>
      <ToolbarButton
        onClick={handleClick}
        data-testid="layout-button"
        icon={
          !isGrid ? (
            <VividIcon
              name="layout-2-solid"
              customSize={-5}
              data-testid="ViewSidebarIcon"
              sx={{ color: isDisabled ? theme.colors.disabled : theme.colors.onSecondary }}
            />
          ) : (
            <VividIcon
              name="apps-solid"
              customSize={-5}
              data-testid="ViewSidebarIcon"
              sx={{ color: isDisabled ? theme.colors.disabled : theme.colors.onSecondary }}
            />
          )
        }
        sx={{
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          marginTop: isOverflowButton ? '0px' : '4px',
        }}
        isOverflowButton={isOverflowButton}
      />
    </Tooltip>
  );
};

export default LayoutButton;
