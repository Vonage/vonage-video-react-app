import { useNavigate } from 'react-router-dom';
import { ReactElement } from 'react';
import Typography from '@ui/Typography';
import { useTranslation } from 'react-i18next';
import Card from '@ui/Card';
import generateRoomName from '../../utils/generateRoomName';
import NewRoomButton from '../NewRoomButton';
import JoinContainerSeparator from '../JoinContainerSeparator';
import JoinExistingRoom from '../JoinExistingRoom';
import useTheme from '@ui/theme';

/**
 * RoomJoinContainer Component
 *
 * This component renders UI elements for creating a new room or joining an existing one.
 * @returns {ReactElement} The room join container component.
 */
const RoomJoinContainer = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const randomRoom = generateRoomName();

  const handleNewRoom = () => {
    navigate(`/waiting-room/${randomRoom}`);
  };

  return (
    <Card component="form">
      <Typography sx={{ mb: 2, typography: 'h6', color: theme.colors.textSecondary }}>
        {t('button.startNewRoom')}
      </Typography>
      <NewRoomButton handleNewRoom={handleNewRoom} />
      <JoinContainerSeparator />
      <Typography sx={{ mb: 2, typography: 'h6', color: theme.colors.textSecondary }}>
        {t('button.joinExistingMeeting')}
      </Typography>
      <JoinExistingRoom />
    </Card>
  );
};

export default RoomJoinContainer;
