import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import { VIDEO_CONTAINER_HEIGHT_WR } from '@utils/constants';

/**
 * VignetteEffect Component
 *
 * Adds a vignetting effect to the publisher preview to draw the user's attention
 * toward the center of the image.
 * @returns {ReactElement} - The VignetteEffect component.
 */
const VignetteEffect = (): ReactElement => {
  return (
    <Box
      sx={{
        position: 'absolute',
        height: `${VIDEO_CONTAINER_HEIGHT_WR + 1}px`,
        width: '100%',
        boxShadow:
          'inset 0px 100px 30px -20px color-mix(in srgb, var(--vera-secondary) 40%, transparent), inset 0px -100px 30px -20px color-mix(in srgb, var(--vera-secondary) 40%, transparent)',
      }}
    />
  );
};

export default VignetteEffect;
