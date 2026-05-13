import { ReactElement } from 'react';
import useDateTime from '../../../hooks/useDateTime';
import useSessionContext from '../../../hooks/useSessionContext';
import Box from '@mui/material/Box';

/**
 *  TimeRoomName Component
 *
 *  This component shows the current time and room name.
 * @returns {ReactElement} - The Time and Room Name component.
 */
const TimeRoomName = (): ReactElement => {
  const { time } = useDateTime();
  const { sessionDetails } = useSessionContext();

  return (
    <Box
      className="text-vera-accent"
      sx={{
        ml: 1,
        mt: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {time} | {sessionDetails?.roomName}
    </Box>
  );
};

export default TimeRoomName;
