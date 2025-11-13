import { ReactElement, useState } from 'react';
import Stack from '@ui/Stack';
import JoinButton from '../JoinButton';
import RoomNameInput from '../RoomNameInput';

/**
 * JoinExistingRoom Component
 *
 * Displays a text box and button to join the waiting room for a custom room.
 * @returns {ReactElement} - The JoinExistingRoom component.
 */
const JoinExistingRoom = (): ReactElement => {
  const [roomName, setRoomName] = useState('');
  const [hasError, setHasError] = useState(false);

  return (
    <Stack
      direction="column"
      component="form"
      data-testid="JoinExistingRoom"
      spacing={3}
      sx={{ mb: 6, width: '100%' }}
    >
      <RoomNameInput
        setRoomName={setRoomName}
        roomName={roomName}
        hasError={hasError}
        setHasError={setHasError}
      />

      <JoinButton roomName={roomName} isDisabled={hasError} />
    </Stack>
  );
};

export default JoinExistingRoom;
