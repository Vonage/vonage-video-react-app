import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import VividIcon from '@ui/components/VividIcon';
import { VIDEO_CONTAINER_BUTTON_SIZE_WR } from '@utils/constants';
import requestDeviceAccess from '@utils/publisher/requestDeviceAccess';
import VideoContainerButton from '../VideoContainerButton';
import DevicePermissionBadge from '../../DevicePermissionBadge';
import { env } from '../../../env';

/**
 * MicButton Component
 *
 * Toggles the user's microphone (published audio) and updates the icon accordingly. When the
 * browser has blocked the microphone the button shows the muted icon plus a warning badge and
 * a "blocked" tooltip (Google Meet style), distinguishing it from a user-initiated mute.
 * @returns {ReactElement | false} - The MicButton component.
 */
const MicButton = (): ReactElement | false => {
  const { t } = useTranslation();
  const { isAudioEnabled, toggleAudio, deniedDevices } = usePreviewPublisherContext();

  const isMicrophoneBlocked = deniedDevices.microphone;
  // A blocked mic has no track, so present it as muted regardless of the user's toggle intent.
  const showMuted = isMicrophoneBlocked || !isAudioEnabled;

  const title = (() => {
    if (isMicrophoneBlocked) return t('devices.audio.microphone.state.blocked');
    return isAudioEnabled
      ? t('devices.audio.microphone.state.off')
      : t('devices.audio.microphone.state.on');
  })();

  // A blocked mic can't be toggled, so a click instead re-requests browser access. The prompt only
  // reappears while the permission is still pending (e.g. a dismissed prompt); after an explicit
  // block the browser stays silent and the tooltip guides the user to their settings. A successful
  // grant is recovered in place by the preview publisher's permission watcher.
  const handleClick = () => {
    if (isMicrophoneBlocked) {
      void requestDeviceAccess({ device: 'microphone' });
      return;
    }
    toggleAudio();
  };

  return (
    env.ALLOW_MICROPHONE_CONTROL && (
      <span className="relative inline-flex">
        <Box
          data-testid="mic-button-wrapper"
          className={classNames({
            'border border-vera-on-secondary': !showMuted,
            'border-none': showMuted,
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
              onClick={handleClick}
              className={classNames(
                'hover:bg-[color-mix(in_srgb,var(--vera-on-secondary)_60%,transparent)]!',
                {
                  'bg-vera-alert-background! hover:bg-vera-alert-background-hover!': showMuted,
                }
              )}
              sx={{
                '&:hover': {
                  backgroundColor: showMuted
                    ? undefined
                    : 'color-mix(in srgb, var(--vera-on-secondary) 60%, transparent)',
                },
              }}
              icon={
                showMuted ? (
                  <VividIcon
                    name="mic-mute-line"
                    customSize={-5}
                    style={{ color: 'var(--vera-alert-text)', transform: 'scaleX(-1)' }}
                  />
                ) : (
                  <VividIcon
                    name="microphone-line"
                    customSize={-5}
                    style={{ color: 'var(--vera-on-secondary)' }}
                  />
                )
              }
            />
          </Tooltip>
        </Box>
        {isMicrophoneBlocked && <DevicePermissionBadge />}
      </span>
    )
  );
};

export default MicButton;
