import { ReactElement } from 'react';
import useDateTime from '../../../hooks/useDateTime';
import useRoomName from '../../../hooks/useRoomName';
import Box from '@mui/material/Box';
import useTheme from '@ui/theme';

/**
 *  TimeRoomName Component
 *
 *  This component shows the current time and room name.
 * @returns {ReactElement} - The Time and Room Name component.
 */
const TimeRoomName = (): ReactElement => {
  const { time } = useDateTime();
  const theme = useTheme();
  const roomName = useRoomName();

  return (
    <Box
      sx={{
        ml: 1,
        mt: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: theme.colors.accent,
      }}
    >
      {time} | {roomName}
    </Box>
  );
};

export default TimeRoomName;
