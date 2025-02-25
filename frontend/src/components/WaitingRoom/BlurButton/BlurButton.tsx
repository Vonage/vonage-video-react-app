import { Box, Tooltip } from '@mui/material';
import BlurOff from '@mui/icons-material/BlurOff';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import { ReactElement } from 'react';
import usePreviewPublisherContext from '../../../hooks/usePreviewPublisherContext';
import BlurIcon from '../../Icons/Blur';
import VideoContainerToggleButton from '../VideoContainerToggleButton';

/**
 * BlurButton Component
 *
 * If the user's device supports the Vonage Media Processor, displays a button to toggle background blur on and off.
 * @returns {ReactElement | false} - The BlurButton component.
 */
const BlurButton = (): ReactElement | false => {
  const { toggleBlur, hasBlur } = usePreviewPublisherContext();
  const title = `Turn background blur ${hasBlur ? 'off' : 'on'}`;

  return (
    hasMediaProcessorSupport() && (
      <Box
        sx={{
          display: 'flex',
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '1px solid white',
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out',
        }}
      >
        <Tooltip title={title} aria-label="toggle background blur">
          <VideoContainerToggleButton
            onClick={toggleBlur}
            isEnabled={!hasBlur}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
              },
            }}
            icon={
              hasBlur ? (
                <BlurOff sx={{ fontSize: '24px', color: 'white' }} />
              ) : (
                <BlurIcon sx={{ fontSize: '24px', color: 'white' }} />
              )
            }
          />
        </Tooltip>
      </Box>
    )
  );
};

export default BlurButton;
