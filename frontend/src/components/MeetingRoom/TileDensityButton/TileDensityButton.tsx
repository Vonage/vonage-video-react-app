import { MouseEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Popover from '@mui/material/Popover';
import ToolbarButton from '../ToolbarButton';
import useSessionContext from '@hooks/useSessionContext';

export type TileDensityButtonProps = {
  isOverflowButton?: boolean;
};

const SliderGlyph = () => (
  <span className="flex h-4 w-5 flex-col items-center justify-center gap-0.5">
    <span className="h-0.5 w-3 rounded-full bg-vera-on-secondary" />
    <span className="h-0.5 w-4 rounded-full bg-vera-primary" />
    <span className="h-0.5 w-3 rounded-full bg-vera-on-secondary" />
  </span>
);

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

const TileDensityButton = ({ isOverflowButton = false }: TileDensityButtonProps) => {
  const { t } = useTranslation();
  const { tilePreferences, setTilePreferences, tileLimitBounds, baseTileLimits } =
    useSessionContext();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isOpen = useMemo(() => Boolean(anchorEl), [anchorEl]);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const handleChange = (key: 'grid' | 'speaker') => (next: number) => {
    setTilePreferences((prev) => ({ ...prev, [key]: next }));
  };

  const handleReset = () => {
    setTilePreferences(baseTileLimits);
  };

  return (
    <>
      <ToolbarButton
        onClick={handleOpen}
        aria-label={t('layout.tileDensity.ariaLabel')}
        data-testid="tile-density-button"
        icon={<SliderGlyph />}
        isOverflowButton={isOverflowButton}
      />
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none' } }}
      >
        <div className="min-w-[280px] max-w-[320px] space-y-4 rounded-lg border border-vera-dark-grey bg-vera-dark-background px-4 py-3 text-vera-on-dark-grey shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-vera-on-dark-grey">
                {t('layout.tileDensity.title')}
              </p>
              <p className="text-xs text-vera-text-tertiary">{t('layout.tileDensity.helper')}</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-medium text-vera-primary hover:text-vera-primary-hover"
            >
              {t('layout.tileDensity.reset')}
            </button>
          </div>
          <TileSlider
            label={t('layout.tileDensity.gridLabel')}
            value={tilePreferences.grid}
            min={tileLimitBounds.grid.min}
            max={tileLimitBounds.grid.max}
            onChange={handleChange('grid')}
          />
          <TileSlider
            label={t('layout.tileDensity.speakerLabel')}
            value={tilePreferences.speaker}
            min={tileLimitBounds.speaker.min}
            max={tileLimitBounds.speaker.max}
            onChange={handleChange('speaker')}
          />
        </div>
      </Popover>
    </>
  );
};

export default TileDensityButton;
