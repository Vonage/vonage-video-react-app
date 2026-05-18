import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_ZOOM, MIN_ZOOM } from '../../../utils/constants';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import VividIcon from '@ui/VividIcon';

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

  const outerClickHandler = isZoomed ? undefined : handleMainClick;
  const innerClickHandler = outerClickHandler ? undefined : handleMainClick;

  return (
    <Box
      className="bg-vera-dark-grey-opacity rounded-vera-large"
      sx={{
        position: 'absolute',
        bottom: 8,
        right: 8,
        display: 'flex',
        alignItems: 'center',
        gap: isZoomed ? 1 : 0,
        p: 0.75,
        cursor: isZoomed ? 'default' : 'pointer',
      }}
      onClick={outerClickHandler}
    >
      {/* Main zoom indicator button */}
      <Tooltip
        arrow
        title={isZoomed ? t('zoom.reset') : t('zoom.start')}
        open={tooltipOpen}
        onOpen={() => setTooltipOpen(true)}
        onClose={() => setTooltipOpen(false)}
      >
        <IconButton
          onClick={innerClickHandler}
          data-testid="zoom-indicator-button"
          onMouseLeave={() => setTooltipOpen(false)}
          sx={{
            p: isZoomed ? undefined : 0.75,
          }}
        >
          {isZoomed ? (
            <VividIcon
              customSize={-6}
              name="zoom-out-solid"
              style={{ color: 'var(--vera-on-dark-grey)' }}
            />
          ) : (
            <VividIcon
              customSize={-6}
              name="zoom-in-solid"
              style={{ color: 'var(--vera-on-dark-grey)' }}
            />
          )}
        </IconButton>
      </Tooltip>

      {/* Zoom controls */}
      {isZoomed && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <>
            <Tooltip arrow title={t('zoom.out')}>
              <Box component="span">
                <IconButton
                  onClick={zoomOut}
                  disabled={!canZoomOut}
                  className="text-vera-on-dark-grey disabled:text-vera-disabled"
                  data-testid="zoom-out-button"
                  sx={{
                    p: 0.5,
                  }}
                >
                  <VividIcon
                    customSize={-6}
                    name="minus-solid"
                    style={{ color: 'var(--vera-on-dark-grey)' }}
                  />
                </IconButton>
              </Box>
            </Tooltip>

            {/* Zoom percentage display */}
            {isZoomed && (
              <Tooltip arrow title={t('zoom.current')}>
                <Typography
                  component="span"
                  className="text-vera-on-dark-grey"
                  sx={{ mx: 1, cursor: 'default' }}
                  data-testid="zoom-level"
                >
                  {Math.round(zoomLevel * 100)}%
                </Typography>
              </Tooltip>
            )}
            <Tooltip arrow title={t('zoom.in')}>
              <Box component="span">
                <IconButton
                  onClick={zoomIn}
                  disabled={!canZoomIn}
                  className="text-vera-on-dark-grey disabled:text-vera-disabled"
                  data-testid="zoom-in-button"
                  sx={{
                    p: 0.5,
                  }}
                >
                  <VividIcon
                    customSize={-6}
                    name="plus-solid"
                    style={{ color: 'var(--vera-on-dark-grey)' }}
                  />
                </IconButton>
              </Box>
            </Tooltip>
          </>
        </Box>
      )}
    </Box>
  );
};

export default ZoomIndicator;
