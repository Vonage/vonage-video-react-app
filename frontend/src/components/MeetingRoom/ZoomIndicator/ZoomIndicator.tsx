import { ZoomInOutlined, ZoomOutOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { ReactElement } from 'react';

export type ZoomIndicatorProps = {
  zoomLevel: number;
  resetZoom: () => void;
};

/**
 * ZoomIndicator Component
 *
 * This component indicates the zoom-level of a screenshare component. It is
 * visible when a participant zooms in on a screenshare. There is a zoom-reset
 * button and a zoom percentage indicator.
 * @param {ZoomIndicatorProps} props - The props for the component
 *  @property {number} zoomLevel - the zoom level of the screenshare component. (`1` corresponds to 100% zoom)
 *  @property {() => void} resetZoom - function to reset zoom level to 100%
 * @returns {ReactElement} The zoom indicator component
 */
const ZoomIndicator = ({ zoomLevel, resetZoom }: ZoomIndicatorProps): false | ReactElement => {
  const isZoomed = zoomLevel !== 1;

  return (
    <div className="absolute bottom-3 right-3 rounded-xl bg-darkGray-55 px-2 py-1 text-sm text-white">
      <Tooltip title={isZoomed ? 'Reset Zoom' : 'Zoom In'}>
        <IconButton onClick={resetZoom} data-testid="zoom-indicator-button">
          {isZoomed ? (
            <ZoomOutOutlined sx={{ fontSize: '18px', color: 'white' }} />
          ) : (
            <ZoomInOutlined sx={{ fontSize: '18px', color: 'white' }} />
          )}
        </IconButton>
      </Tooltip>
      {isZoomed && (
        <span className="cursor-default" data-testid="zoom-indicator-text">
          {Math.round(zoomLevel * 100)}%
        </span>
      )}
    </div>
  );
};

export default ZoomIndicator;
