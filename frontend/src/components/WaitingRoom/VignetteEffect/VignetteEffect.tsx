import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import useTheme from '@ui/theme';
import { VIDEO_CONTAINER_HEIGHT_WR } from '@utils/constants';

/**
 * VignetteEffect Component
 *
 * Adds a vignetting effect to the publisher preview to draw the user's attention
 * toward the center of the image.
 * @returns {ReactElement} - The VignetteEffect component.
 */
const VignetteEffect = (): ReactElement => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        height: `${VIDEO_CONTAINER_HEIGHT_WR + 1}px`,
        width: '100%',
        boxShadow: `inset 0px 100px 30px -20px ${theme.colors.secondary}66, inset 0px -100px 30px -20px ${theme.colors.secondary}66`,
      }}
    />
  );
};

export default VignetteEffect;
