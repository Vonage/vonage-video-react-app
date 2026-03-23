import { useNavigate } from 'react-router-dom';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@ui/Card';
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const randomRoom = generateRoomName();

  const handleNewRoom = () => {
    navigate(`/waiting-room/${randomRoom}`);
  };

  return (
    <Card component="form" className="lg:max-w-125">
      <h6 className="text-xl font-medium font-vera-plain text-vera-secondary mb-4">
        {t('button.startNewRoom')}
      </h6>
      <NewRoomButton handleNewRoom={handleNewRoom} />
      <JoinContainerSeparator />
      <h6 className="text-xl font-medium font-vera-plain text-vera-secondary mb-4">
        {t('button.joinExistingMeeting')}
      </h6>
      <JoinExistingRoom />
    </Card>
  );
};

export default RoomJoinContainer;
