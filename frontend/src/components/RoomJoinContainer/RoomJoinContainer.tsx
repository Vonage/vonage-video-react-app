import { useNavigate } from 'react-router-dom';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { runtime$ } from '@core/stores';
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
  const videoClient = runtime$.useVideoClient();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNewRoom = async () => {
    const randomRoom = generateRoomName();

    const { sessionKey } = await videoClient.createSession({ roomName: randomRoom });

    navigate(`/waiting-room/${sessionKey}`);
  };

  return (
    <Card component="form" className="lg:max-w-125">
      <h6 className="font-vera-plain text-vera-heading-4 text-vera-secondary mb-4">
        {t('button.startNewRoom')}
      </h6>
      <NewRoomButton handleNewRoom={handleNewRoom} />

      <JoinContainerSeparator />

      <h6 className="font-vera-plain text-vera-heading-4 text-vera-secondary mb-4">
        {t('button.joinExistingMeeting')}
      </h6>

      <JoinExistingRoom />
    </Card>
  );
};

export default RoomJoinContainer;
