import { ReactElement, useState } from 'react';
import JoinWaitRoomButton from '../JoinWaitRoomButton';
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
    <div className="flex w-full flex-col gap-6" data-testid="JoinExistingRoom">
      <RoomNameInput
        setRoomName={setRoomName}
        roomName={roomName}
        hasError={hasError}
        setHasError={setHasError}
      />

      <JoinWaitRoomButton roomName={roomName} isDisabled={false} setHasError={setHasError} />
    </div>
  );
};

export default JoinExistingRoom;
