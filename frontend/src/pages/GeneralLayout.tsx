import Banner from '@components/Banner';
import Box from '@ui/Box';
import Stack from '@ui/Stack';
import { ReactNode } from 'react';

const GeneralLayout = ({ leftSide, rightSide }: { leftSide: ReactNode; rightSide: ReactNode }) => {
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
          {leftSide}
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
          {rightSide}
        </Box>
      </Stack>
    </Box>
  );
};

export default GeneralLayout;
