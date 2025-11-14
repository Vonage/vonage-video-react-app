import { Box, SxProps } from '@mui/material';
import { ReactElement } from 'react';

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
    <Box sx={{ ...sx }} key={20} display="flex" flexDirection="column" gap={2} alignItems="center">
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8%',
          height: size,
          width: size,
          borderRadius: '50%',
          backgroundColor: theme.palette.primary.main,
        })}
      >
        {barHeights.map((height, i) => (
          <Box
            // https://stackoverflow.com/questions/46735483/error-do-not-use-array-index-in-keys
            // eslint-disable-next-line react/no-array-index-key
            key={i} // NOSONAR
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              height: height / 4,
              minHeight: '10%',
              width: '10%',
              backgroundColor: theme.palette.background.default,
            })}
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
