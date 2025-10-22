import { ZoomInOutlined, ZoomOutOutlined, Add, Remove } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_ZOOM, MIN_ZOOM } from '../../../utils/constants';

export type ZoomIndicatorProps = {
  zoomLevel: number;
  resetZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
};

/**
 * ZoomIndicator Component
 *
 * This component indicates the zoom-level of a screenshare component. It is
 * visible when a participant zooms in on a screenshare. There is a zoom-reset
 * button and a zoom percentage indicator, plus zoom in/out controls.
 * @param {ZoomIndicatorProps} props - The props for the component
 *  @property {number} zoomLevel - the zoom level of the screenshare component. (`1` corresponds to 100% zoom)
 *  @property {() => void} resetZoom - function to reset zoom level to 100%
 *  @property {() => void} zoomIn - function to zoom in one level
 *  @property {() => void} zoomOut - function to zoom out one level
 * @returns {ReactElement} The zoom indicator component
 */
const ZoomIndicator = ({
  zoomLevel,
  resetZoom,
  zoomIn,
  zoomOut,
}: ZoomIndicatorProps): false | ReactElement => {
  const isZoomed = zoomLevel !== 1;
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const { t } = useTranslation();

  // Check if we can zoom in/out more
  const canZoomIn = zoomLevel < MAX_ZOOM;
  const canZoomOut = zoomLevel > MIN_ZOOM;

  const handleMainClick = () => {
    // Close tooltip immediately on click
    setTooltipOpen(false);

    if (isZoomed) {
      resetZoom();
    } else {
      zoomIn();
    }
  };

  return (
    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-xl bg-darkGray-55 px-2 py-1 text-sm text-white">
      {/* Main zoom indicator button */}
      <Tooltip
        title={isZoomed ? t('zoom.reset') : t('zoom.start')}
        open={tooltipOpen}
        onOpen={() => setTooltipOpen(true)}
        onClose={() => setTooltipOpen(false)}
      >
        <IconButton
          onClick={handleMainClick}
          data-testid="zoom-indicator-button"
          onMouseLeave={() => setTooltipOpen(false)}
        >
          {isZoomed ? (
            <ZoomOutOutlined sx={{ fontSize: '18px', color: 'white' }} />
          ) : (
            <ZoomInOutlined sx={{ fontSize: '18px', color: 'white' }} />
          )}
        </IconButton>
      </Tooltip>

      {/* Zoom controls */}
      <div className="flex items-center gap-0">
        {isZoomed && (
          <>
            <Tooltip title={t('zoom.out')}>
              <span>
                <IconButton
                  onClick={zoomOut}
                  disabled={!canZoomOut}
                  data-testid="zoom-out-button"
                  sx={{
                    padding: '4px',
                    color: 'white',
                    '&:disabled': {
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  <Remove sx={{ fontSize: '16px', color: 'inherit' }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('zoom.in')}>
              <span>
                <IconButton
                  onClick={zoomIn}
                  disabled={!canZoomIn}
                  data-testid="zoom-in-button"
                  sx={{
                    padding: '4px',
                    color: 'white',
                    '&:disabled': {
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  <Add sx={{ fontSize: '16px', color: 'inherit' }} />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}

        {/* Zoom percentage display */}
        {isZoomed && (
          <Tooltip title={t('zoom.current')}>
            <span className="mx-1 cursor-default" data-testid="zoom-level">
              {Math.round(zoomLevel * 100)}%
            </span>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default ZoomIndicator;
