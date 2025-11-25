import { useNavigate } from 'react-router-dom';
import { ReactElement } from 'react';
import Box from '@ui/Box';
import Typography from '@ui/Typography';
import useCustomTheme from '@Context/Theme';
import GoToLandingPageButton from '../GoToLandingPageButton';
import ReenterRoomButton from '../ReenterRoomButton';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type GoodByeMessageProps = {
  header: string;
  message: string;
  roomName: string;
};

/**
 * GoodByeMessage Component
 * Displays a goodbye message to the user along with two navigation buttons - one to the previously left room, and another for the landing page.
 * @param {GoodByeMessageProps} props - The props for the component.
 * @returns {ReactElement} The GoodByeMessage component.
 */
const GoodByeMessage = ({ header, message, roomName }: GoodByeMessageProps): ReactElement => {
  const isSmallViewport = useIsSmallViewport();
  const navigate = useNavigate();
  const theme = useCustomTheme();
  const handleLanding = () => {
    navigate('/');
  };

  const handleReenter = () => {
    navigate(`/waiting-room/${roomName}`);
  };
  return (
    <Box
      sx={{
        height: 'auto',
        width: '100%',
        flexShrink: 1,
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 6,
        textAlign: 'left',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          width: '75%',
          paddingBottom: 2.5,
          color: theme.colors.textSecondary,
        }}
        data-testid="header-message"
      >
        {header}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          paddingRight: 6,
          color: theme.colors.textTertiary,
          width: isSmallViewport ? '100%' : '400px',
        }}
        data-testid="goodbye-message"
      >
        {message}
      </Typography>
      <Box
        sx={{
          marginTop: 3,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          paddingRight: 0,
        }}
      >
        <ReenterRoomButton handleReenter={handleReenter} roomName={roomName} />

        <GoToLandingPageButton handleLanding={handleLanding} />
      </Box>
    </Box>
  );
};

export default GoodByeMessage;
