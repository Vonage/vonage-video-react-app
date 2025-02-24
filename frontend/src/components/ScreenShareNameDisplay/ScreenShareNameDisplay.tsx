import { Chip } from '@mui/material';
import { Box } from 'opentok-layout-js';
import { ReactElement } from 'react';

export type ScreenShareNameDisplayProps = {
  name: string;
  box: Box;
};

/**
 * ScreenShareNameDisplay Component
 *
 * Displays the name of who's screen-sharing along with an identifier that it's a screen video tile.
 * @param {ScreenShareNameDisplayProps} props - The props for the component.
 * @returns {ReactElement} The ScreenShareNameDisplay component.
 */
const ScreenShareNameDisplay = ({ name, box }: ScreenShareNameDisplayProps): ReactElement => {
  return (
    <Chip
      label={name}
      size="small"
      sx={{
        color: 'white',
        backgroundColor: 'rgba(60, 64, 67, 0.55)',
        maxWidth: box.width - 32,
      }}
      className="absolute bottom-[10px] left-[10px] truncate text-sm md:text-lg"
    />
  );
};

export default ScreenShareNameDisplay;
