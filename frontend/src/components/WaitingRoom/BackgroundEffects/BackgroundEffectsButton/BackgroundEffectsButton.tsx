import { Box, Tooltip } from '@mui/material';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import { ReactElement } from 'react';
import PortraitIcon from '@mui/icons-material/Portrait';
import VideoContainerButton from '../../VideoContainerButton';

interface BackgroundEffectsButtonProps {
  onClick: () => void;
}

/**
 * BackgroundEffectsButton Component
 *
 * If the user's device supports the Vonage Media Processor, displays a button to modify background effects.
 * @param {BackgroundEffectsButtonProps} props - The props for the component.
 *   @property {Function} onClick - Function to call when the button is clicked.
 * @returns {ReactElement | false} - The BackgroundEffectsButton component.
 */
const BackgroundEffectsButton = ({
  onClick,
}: BackgroundEffectsButtonProps): ReactElement | false => {
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
        <Tooltip title="Background Effects" aria-label="Background Effects">
          <VideoContainerButton
            onClick={onClick}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
              },
            }}
            icon={<PortraitIcon sx={{ fontSize: '24px', color: 'white' }} />}
          />
        </Tooltip>
      </Box>
    )
  );
};

export default BackgroundEffectsButton;
