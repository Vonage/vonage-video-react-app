import { useNavigate } from 'react-router-dom';
import { ReactElement } from 'react';
import { Box } from '@mui/material';
import generateRoomName from '../../utils/generateRoomName';
import NewRoomButton from '../NewRoomButton';
import JoinContainerSeparator from '../JoinContainerSeparator';
import JoinExistingRoom from '../JoinExistingRoom';

/**
 * RoomJoinContainer Component
 *
 * This component renders UI elements for creating a new room or joining an existing one.
 * @returns {ReactElement} The room join container component.
 */
const RoomJoinContainer = (): ReactElement => {
  const navigate = useNavigate();
  const randomRoom = generateRoomName();

  const handleNewRoom = () => {
    navigate(`/waiting-room/${randomRoom}`);
  };

  return (
    <Box
      sx={{
        maxWidth: { xs: '100%', md: '500px' },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: { xs: 'background.paper', md: 'background.default' },
      }}
    >
      <NewRoomButton handleNewRoom={handleNewRoom} />
      <JoinContainerSeparator />
      <JoinExistingRoom />
    </Box>
  );
};

export default RoomJoinContainer;
