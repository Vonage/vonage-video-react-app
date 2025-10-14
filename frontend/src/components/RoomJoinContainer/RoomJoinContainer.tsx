import { useNavigate } from 'react-router-dom';
import { ReactElement } from 'react';
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

  // After a room is created, the user is redirected to a waiting room
  // where they have an option to pick their devices, add their name, and join the meeting room
  const handleNewRoom = () => {
    navigate(`/precall/${randomRoom}`);
  };

  return (
    <div className="mt-6 flex w-10/12 max-w-xl flex-1 flex-col items-center justify-start md:mt-0 md:justify-center md:pe-12">
      <NewRoomButton handleNewRoom={handleNewRoom} />

      <JoinContainerSeparator />

      <JoinExistingRoom />
    </div>
  );
};

export default RoomJoinContainer;
