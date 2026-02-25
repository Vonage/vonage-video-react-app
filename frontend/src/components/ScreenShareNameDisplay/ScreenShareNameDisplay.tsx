import useTheme from '@ui/theme';
import Chip from '@mui/material/Chip';
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
  const theme = useTheme();
  const safeMaxWidth = typeof box.width === 'number' && Number.isFinite(box.width) ? box.width : 0;

  return (
    <Chip
      label={name}
      size="small"
      sx={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: theme.colors.onDarkGrey,
        backgroundColor: theme.colors.darkGreyOpacity,
        maxWidth: Math.max(0, safeMaxWidth - 32),
      }}
    />
  );
};

export default ScreenShareNameDisplay;
