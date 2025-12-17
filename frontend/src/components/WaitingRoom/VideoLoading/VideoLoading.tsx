import CircularProgress from '@ui/CircularProgress';
import { ReactElement } from 'react';
import Box from '@ui/Box';
import useTheme from '@ui/theme';
import { VIDEO_CONTAINER_HEIGHT_WR } from '@utils/constants';

/**
 * VideoLoading Component
 *
 * Displays a video loading component while the Preview Publisher is being initialized.
 * @returns {ReactElement} - The VideoLoading component
 */
const VideoLoading = (): ReactElement => {
  const theme = useTheme();

  return (
    <Box
      data-testid="VideoLoading"
      sx={{
        position: 'absolute',
        display: 'flex',
        height: `${VIDEO_CONTAINER_HEIGHT_WR}px`,
        width: '100dvw',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '16px',
        backgroundColor: theme.colors.secondary,
      }}
    >
      <CircularProgress
        sx={{
          position: 'relative',
          zIndex: 10,
        }}
        data-testid="CircularProgress"
      />
    </Box>
  );
};

export default VideoLoading;
