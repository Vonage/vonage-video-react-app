import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import VividIcon from '@ui/VividIcon';
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

  const title = isAudioEnabled
    ? t('devices.audio.microphone.state.off')
    : t('devices.audio.microphone.state.on');

  return (
    env.ALLOW_MICROPHONE_CONTROL && (
      <Box
        data-testid="mic-button-wrapper"
        className={classNames({
          'border border-vera-on-secondary': isAudioEnabled,
          'border-none': !isAudioEnabled,
        })}
        sx={{
          display: 'flex',
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
          width: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
          height: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out',
        }}
      >
        <Tooltip arrow title={title} aria-label={t('devices.audio.microphone.ariaLabel')}>
          <VideoContainerButton
            onClick={toggleAudio}
            className={classNames(
              'hover:bg-[color-mix(in_srgb,var(--vera-on-secondary)_60%,transparent)]!',
              {
                'bg-vera-alert-background! hover:bg-vera-alert-background-hover!': !isAudioEnabled,
              }
            )}
            sx={{
              '&:hover': {
                backgroundColor: isAudioEnabled
                  ? 'color-mix(in srgb, var(--vera-on-secondary) 60%, transparent)'
                  : undefined,
              },
            }}
            icon={
              isAudioEnabled ? (
                <VividIcon
                  name="microphone-line"
                  customSize={-5}
                  style={{ color: 'var(--vera-on-secondary)' }}
                />
              ) : (
                <VividIcon
                  name="mic-mute-line"
                  customSize={-5}
                  style={{ color: 'var(--vera-alert-text)', transform: 'scaleX(-1)' }}
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
