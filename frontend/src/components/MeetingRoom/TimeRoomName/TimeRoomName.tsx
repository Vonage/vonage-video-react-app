import { ReactElement } from 'react';
import useDateTime from '../../../hooks/useDateTime';
import useRoomName from '../../../hooks/useRoomName';
import Box from '@ui/Box';
import useCustomTheme from '@Context/Theme';

/**
 *  TimeRoomName Component
 *
 *  This component shows the current time and room name.
 * @returns {ReactElement} - The Time and Room Name component.
 */
const TimeRoomName = (): ReactElement => {
  const { time } = useDateTime();
  const theme = useCustomTheme();
  const roomName = useRoomName();

  return (
    <Box
      sx={{
        ml: 1,
        mt: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: theme.colors.onPrimary,
      }}
    >
      {time} | {roomName}
    </Box>
  );
};

export default TimeRoomName;
