import { ZoomOutOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { ReactElement } from 'react';

export type ZoomIndicatorProps = {
  zoomLevel: number;
  resetZoom: () => void;
};

const ZoomIndicator = ({ zoomLevel, resetZoom }: ZoomIndicatorProps): false | ReactElement => {
  // return (
  //   zoomLevel !== 1 && (
  //     <div
  //       className="absolute bottom-3 right-3 rounded-xl bg-darkGray-55 px-2 py-1 text-sm text-white"
  //       style={{ cursor: 'pointer' }}
  //       onClick={resetZoom}
  //       onMouseEnter={() => console.warn('inside the zoom div')}
  //     >
  //       {Math.round(zoomLevel * 100)}%
  //     </div>
  //   )
  // );
  return (
    <div className="absolute bottom-3 right-3 rounded-xl bg-darkGray-55 px-2 py-1 text-sm text-white">
      <Tooltip title="Reset Zoom">
        <IconButton onClick={resetZoom}>
          <ZoomOutOutlined sx={{ fontSize: '18px', color: 'white' }} />
        </IconButton>
      </Tooltip>
      {zoomLevel !== 1 && <span className="cursor-default">{Math.round(zoomLevel * 100)}%</span>}
    </div>
  );
};

export default ZoomIndicator;
