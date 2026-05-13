import { ReactElement } from 'react';
import type { SxProps } from '@mui/material';
import Box from '@mui/material/Box';

export type VoiceIndicatorProps = {
  publisherAudioLevel: number;
  sx?: SxProps;
  size: number;
};

// This function calculates the height of three bars to produce a fading effect on the audio indicator
const calculateBarHeights = (publisherAudioLevel: number) => {
  if (publisherAudioLevel < 10) {
    return [0, 0, 0];
  }
  const height1 = 5 + (25 * publisherAudioLevel) / 100;
  const height2 = 20 + (40 * publisherAudioLevel) / 100;
  const height3 = 5 + (25 * publisherAudioLevel) / 100;
  return [height1, height2, height3];
};

/**
 * VoiceIndicator Component
 *
 * This component indicates the loudness of the publisher with a custom icon.
 * It is composed of three bars that move up and down depending on the audio level.
 * @param {VoiceIndicatorProps} props - the props for the component
 *  @property {number} publisherAudioLevel - the audio level of the publisher.
 *  @property {SxProps} sx - the styling properties of the parent component.
 *  @property {number} size - the size of the voice indicator.
 * @returns {ReactElement} The voice indicator component
 */
const VoiceIndicatorIcon = ({
  publisherAudioLevel,
  sx,
  size,
}: VoiceIndicatorProps): ReactElement => {
  const barHeights = calculateBarHeights(publisherAudioLevel);
  const isAnimating = publisherAudioLevel >= 5;

  return (
    <Box key={20} sx={{ ...sx, gap: 2 }} className="flex flex-col items-center">
      <Box
        sx={{
          gap: '8%',
          height: size,
          width: size,
          borderRadius: '50%',
        }}
        className="flex items-center justify-center bg-vera-primary"
      >
        {barHeights.map((height, i) => (
          <Box
            key={i} // NOSONAR
            sx={{
              height: height / 4,
              minHeight: '10%',
              width: '10%',
            }}
            className="flex items-center bg-vera-background"
          >
            <Box
              sx={{
                height: `${height - 20}%`,
                width: '80%',
                // smooth out the animation with a CSS effect
                animation: !isAnimating ? 'none' : 'speech 250ms ease-in-out infinite alternate',
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default VoiceIndicatorIcon;
