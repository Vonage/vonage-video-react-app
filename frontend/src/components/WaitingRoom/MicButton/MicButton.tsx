import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import useTheme from '@ui/theme';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import VividIcon from '@components/VividIcon';
import { VIDEO_CONTAINER_BUTTON_SIZE_WR } from '@utils/constants';
import VideoContainerButton from '../VideoContainerButton';
import { env } from '../../../env';

/**
 * MicButton Component
 *
 * Toggles the user's microphone (published audio) and updates the icon accordingly.
 * @returns {ReactElement | false} - The MicButton component.
 */
const MicButton = (): ReactElement | false => {
  const { t } = useTranslation();
  const { isAudioEnabled, toggleAudio } = usePreviewPublisherContext();
  const theme = useTheme();

  const title = isAudioEnabled
    ? t('devices.audio.microphone.state.off')
    : t('devices.audio.microphone.state.on');

  return (
    env.ALLOW_MICROPHONE_CONTROL && (
      <Box
        data-testid="mic-button-wrapper"
        sx={{
          display: 'flex',
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
          width: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
          height: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
          borderRadius: '50%',
          border: isAudioEnabled ? `1px solid ${theme.colors.onSecondary}` : 'none',
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out',
        }}
      >
        <Tooltip arrow title={title} aria-label={t('devices.audio.microphone.ariaLabel')}>
          <VideoContainerButton
            onClick={toggleAudio}
            sx={{
              backgroundColor: isAudioEnabled ? '' : theme.colors.alertBackground,
              '&:hover': {
                backgroundColor: isAudioEnabled
                  ? `${theme.colors.onSecondary}99`
                  : `${theme.colors.alertBackgroundHover}`,
              },
            }}
            icon={
              isAudioEnabled ? (
                <VividIcon
                  name="microphone-line"
                  customSize={-5}
                  sx={{ color: theme.colors.onSecondary }}
                />
              ) : (
                <VividIcon
                  name="mic-mute-line"
                  customSize={-5}
                  sx={{ color: theme.colors.alertText, transform: 'scaleX(-1)' }}
                />
              )
            }
          />
        </Tooltip>
      </Box>
    )
  );
};

export default MicButton;
