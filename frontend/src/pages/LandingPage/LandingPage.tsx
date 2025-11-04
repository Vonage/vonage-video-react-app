import { ReactElement } from 'react';
import { Box, Stack } from '@mui/material';
import Banner from '../../components/Banner';
import LandingPageWelcome from '../../components/LandingPageWelcome';
import RoomJoinContainer from '../../components/RoomJoinContainer';

/**
 * LandingPage Component
 *
 * This component renders the landing page of the application, including:
 * - A banner containing a company logo, a date-time widget, and a navigable button to a GitHub repo.
 * - A welcome message for users.
 * - A form allowing users to:
 *   - Quickly join the waiting room for a randomly generated room name and session ID.
 *   - Join the waiting room for a specific room name.
 * @returns {ReactElement} - The landing page.
 */
const LandingPage = (): ReactElement => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Banner />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          flex: 1,
          width: '100%',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            bgcolor: { xs: 'background.paper', md: 'primary.light' },
          }}
        >
          <LandingPageWelcome />
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            bgcolor: 'background.paper',
          }}
        >
          <RoomJoinContainer />
        </Box>
      </Stack>
    </Box>
  );
};

export default LandingPage;
