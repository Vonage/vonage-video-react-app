import { useNavigate } from 'react-router-dom';
import { ReactElement } from 'react';
import Box from '@ui/Box';
import Typography from '@ui/Typography';
import { useTranslation } from 'react-i18next';
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
    <Box
      sx={(theme) => ({
        maxWidth: { xs: '100%', md: '500px' },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        bgcolor: { xs: 'background.paper', md: 'background.default' },
        padding: { xs: '0px 0px 0px 0px', md: '40px 40px 0px 40px' },
        borderRadius: theme.shape.borderRadius,
      })}
    >
      <Typography sx={{ mb: 2, typography: 'h6' }}>{t('button.startNewRoom')}</Typography>
      <NewRoomButton handleNewRoom={handleNewRoom} />
      <JoinContainerSeparator />
      <Typography sx={{ mb: 2, typography: 'h6' }}>{t('button.joinExistingMeeting')}</Typography>
      <JoinExistingRoom />
    </Box>
  );
};

export default RoomJoinContainer;
