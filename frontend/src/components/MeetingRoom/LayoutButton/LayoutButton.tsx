import { ReactElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSessionContext from '../../../hooks/useSessionContext';
import ToolbarButton from '../ToolbarButton';
import Tooltip from '@mui/material/Tooltip';
import VividIcon from '@components/VividIcon';
import useTheme from '@ui/theme';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import { env } from '../../../env';

export type LayoutButtonProps = {
  isScreenSharePresent: boolean;
  isPinningPresent: boolean;
  isOverflowButton?: boolean;
  onLayoutModeChange?: () => void;
};

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
};

const TileSlider = ({ label, value, min, max, onChange }: SliderProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-xs text-vera-on-dark-grey">
      <span className="font-medium">{label}</span>
      <span className="text-vera-text-tertiary">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full accent-[var(--vera-primary)]"
      style={{ accentColor: 'var(--vera-primary)' }}
      data-testid="tile-slider"
    />
    <div className="flex items-center justify-between text-[10px] text-vera-text-tertiary">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

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
  const {
    layoutMode,
    setLayoutMode,
    tilePreferences,
    setTilePreferences,
    tileLimitBounds,
    baseTileLimits,
  } = useSessionContext();
  const isGrid = layoutMode === 'grid';
  const isDisabled = isScreenSharePresent || isPinningPresent;
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isOpen = useMemo(() => Boolean(anchorEl), [anchorEl]);

  const handleClose = () => setAnchorEl(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (isDisabled) {
      return;
    }

    if (anchorEl === event.currentTarget) {
      handleClose();
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleSelectLayout = (mode: typeof layoutMode) => {
    setLayoutMode(mode);
    handleClose();
  };

  const handleClick = () => {
    if (isDisabled) {
      return;
    }

    setLayoutMode((prev) => (prev === 'grid' ? 'active-speaker' : 'grid'));
    onLayoutModeChange?.();
    handleClose();
  };

  const handleResetTiles = () => {
    setTilePreferences(baseTileLimits);
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

  const clampToBounds = (value: number, bounds: { min: number; max: number }) =>
    Math.min(Math.max(value, bounds.min), bounds.max);

  const activeBounds = isGrid ? tileLimitBounds.grid : tileLimitBounds.speaker;
  const activePreference = isGrid ? tilePreferences.grid : tilePreferences.speaker;
  const sliderValue = clampToBounds(activePreference, activeBounds);

  const renderToggleButton = (sxOverrides = {}) => (
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
          ...sxOverrides,
        }}
        isOverflowButton={isOverflowButton}
        aria-expanded={env.ALLOW_LAYOUT_ADJUST_VIEW && isOpen}
      />
    </Tooltip>
  );

  if (!env.ALLOW_LAYOUT_ADJUST_VIEW) {
    return renderToggleButton();
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        backgroundColor: theme.colors.darkGrey,
        borderRadius: '30px',
        overflow: 'hidden',
        height: isOverflowButton ? 35 : 48,
        marginTop: isOverflowButton ? 0 : '4px',
        marginRight: isOverflowButton ? 0 : '12px',
      }}
    >
      <ToolbarButton
        onClick={handleOpenMenu}
        data-testid="layout-menu-trigger"
        aria-label={t('layout.menu.open')}
        icon={
          <VividIcon
            name={isOpen ? 'chevron-down-line' : 'chevron-up-line'}
            customSize={-6}
            sx={{ color: isDisabled ? theme.colors.disabled : theme.colors.onSecondary }}
          />
        }
        sx={{
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          marginTop: 0,
          marginRight: 0,
          marginLeft: 0,
          backgroundColor: 'transparent',
          '&:hover': { backgroundColor: theme.colors.darkGreyOpacity },
          width: isOverflowButton ? '28px' : '38px',
          height: isOverflowButton ? '35px' : '48px',
          borderRadius: 0,
        }}
        disabled={isDisabled}
        isOverflowButton={isOverflowButton}
        aria-expanded={isOpen}
      />
      {renderToggleButton({
        marginTop: 0,
        marginRight: 0,
        marginLeft: 0,
        backgroundColor: 'transparent',
        '&:hover': { backgroundColor: theme.colors.darkGreyOpacity },
        width: isOverflowButton ? '35px' : '48px',
        height: isOverflowButton ? '35px' : '48px',
        borderRadius: 0,
      })}
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none' } }}
      >
        <div className="min-w-[300px] max-w-[340px] space-y-4 rounded-lg border border-vera-dark-grey bg-vera-dark-background px-4 py-3 text-vera-on-dark-grey shadow-lg">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-vera-on-dark-grey">{t('layout.menu.title')}</p>
            <p className="text-xs text-vera-text-tertiary">{t('layout.menu.helper')}</p>
          </div>

          <div className="space-y-2" role="group" aria-label={t('layout.menu.title')}>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-vera-dark-grey px-3 py-2 text-sm hover:border-vera-primary/60 hover:text-vera-on-dark-grey">
              <input
                type="radio"
                name="layout-choice"
                value="grid"
                checked={isGrid}
                onChange={() => handleSelectLayout('grid')}
                data-testid="layout-option-grid"
                className="h-4 w-4 accent-[var(--vera-primary)]"
              />
              <div className="flex items-center gap-2">
                <VividIcon
                  name="apps-solid"
                  customSize={-6}
                  sx={{ color: isGrid ? theme.colors.primary : theme.colors.onDarkGrey }}
                />
                <span>{t('layout.menu.grid')}</span>
              </div>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-vera-dark-grey px-3 py-2 text-sm hover:border-vera-primary/60 hover:text-vera-on-dark-grey">
              <input
                type="radio"
                name="layout-choice"
                value="active-speaker"
                checked={!isGrid}
                onChange={() => handleSelectLayout('active-speaker')}
                data-testid="layout-option-active-speaker"
                className="h-4 w-4 accent-[var(--vera-primary)]"
              />
              <div className="flex items-center gap-2">
                <VividIcon
                  name="layout-2-solid"
                  customSize={-6}
                  sx={{ color: !isGrid ? theme.colors.primary : theme.colors.onDarkGrey }}
                />
                <span>{t('layout.menu.speaker')}</span>
              </div>
            </label>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-vera-on-dark-grey">
                {t('layout.tileDensity.title')}
              </p>
              <p className="text-xs text-vera-text-tertiary">{t('layout.tileDensity.helper')}</p>
            </div>
            <button
              type="button"
              onClick={handleResetTiles}
              className="text-xs font-medium text-vera-primary hover:text-vera-primary-hover"
            >
              {t('layout.tileDensity.reset')}
            </button>
          </div>

          <TileSlider
            label={
              isGrid ? t('layout.tileDensity.gridLabel') : t('layout.tileDensity.speakerLabel')
            }
            value={sliderValue}
            min={activeBounds.min}
            max={activeBounds.max}
            onChange={(next) => {
              setTilePreferences((prev) => {
                if (isGrid) {
                  return { ...prev, grid: clampToBounds(next, tileLimitBounds.grid) };
                }
                return { ...prev, speaker: clampToBounds(next, tileLimitBounds.speaker) };
              });
            }}
          />
        </div>
      </Popover>
    </Box>
  );
};

export default LayoutButton;
