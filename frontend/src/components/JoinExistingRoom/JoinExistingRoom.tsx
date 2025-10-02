import { ReactElement, useState } from 'react';
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
    <form className="mt-[35px] flex-row" data-testid="JoinExistingRoom">
      <RoomNameInput
        setRoomName={setRoomName}
        roomName={roomName}
        hasError={hasError}
        setHasError={setHasError}
      />

      <JoinButton roomName={roomName} isDisabled={hasError} />
    </form>
  );
};

export default JoinExistingRoom;
