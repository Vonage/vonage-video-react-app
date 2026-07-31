import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import { VIDEO_CONTAINER_BUTTON_SIZE_WR } from '@utils/constants';
import requestBlockedDeviceRecovery from '@utils/publisher/requestBlockedDeviceRecovery';
import type { DeviceKind } from '@utils/publisher/deviceAccess';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import VividIcon from '@ui/components/VividIcon';
import VideoContainerButton from '../VideoContainerButton';
import DevicePermissionBadge from '../../DevicePermissionBadge';

export type DeviceToggleButtonProps = {
  device: DeviceKind;
  onToggle: () => void;
};

/**
 * Shared waiting-room overlay button for toggling one capture device (camera or microphone) of the
 * preview publisher. When the browser has blocked the device the button shows the off icon plus a
 * warning badge and a "blocked" tooltip (Google Meet style), distinguishing it from a device the
 * user turned off — and a click then re-requests browser access instead of toggling.
 * @param {DeviceToggleButtonProps} props - the props for the component.
 *  @property {DeviceKind} device - which device this button controls.
 *  @property {() => void} onToggle - toggles the device when it isn't blocked.
 * @returns {ReactElement} The DeviceToggleButton component.
 */
const DeviceToggleButton = ({ device, onToggle }: DeviceToggleButtonProps): ReactElement => {
  const { t } = useTranslation();
  const { isAudioEnabled, isVideoEnabled, deniedDevices, reacquireDevice } =
    usePreviewPublisherContext();

  const isMicrophone = device === 'microphone';
  const isEnabled = isMicrophone ? isAudioEnabled : isVideoEnabled;
  const isBlocked = deniedDevices[device];
  // A blocked device has no track, so present it as off regardless of the user's toggle intent.
  const showOff = isBlocked || !isEnabled;

  const translationBase = isMicrophone ? 'devices.audio.microphone' : 'devices.video.camera';
  const title = (() => {
    if (isBlocked) return t(`${translationBase}.state.blocked`);
    return isEnabled ? t(`${translationBase}.state.off`) : t(`${translationBase}.state.on`);
  })();

  // A blocked device can't be toggled, so a click instead re-requests browser access (see
  // requestBlockedDeviceRecovery for the prompt/recovery semantics).
  const handleClick = () => {
    if (isBlocked) {
      requestBlockedDeviceRecovery({ device, reacquireDevice });
      return;
    }
    onToggle();
  };

  return (
    <span className="relative inline-flex">
      <Box
        data-testid={isMicrophone ? 'mic-button-wrapper' : 'camera-button-wrapper'}
        className={classNames({
          'border border-vera-on-secondary': !showOff,
          'border-none': showOff,
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
        <Tooltip arrow title={title} aria-label={t(`${translationBase}.ariaLabel`)}>
          <VideoContainerButton
            onClick={handleClick}
            className={classNames(
              'hover:bg-[color-mix(in_srgb,var(--vera-on-secondary)_60%,transparent)]!',
              {
                'bg-vera-alert-background! hover:bg-vera-alert-background-hover!': showOff,
              }
            )}
            sx={{
              '&:hover': {
                backgroundColor: showOff
                  ? undefined
                  : 'color-mix(in srgb, var(--vera-on-secondary) 60%, transparent)',
              },
            }}
            icon={
              showOff ? (
                <VividIcon
                  name={isMicrophone ? 'mic-mute-line' : 'video-off-line'}
                  customSize={-5}
                  style={{
                    color: 'var(--vera-alert-text)',
                    transform: isMicrophone ? 'scaleX(-1)' : undefined,
                  }}
                />
              ) : (
                <VividIcon
                  name={isMicrophone ? 'microphone-line' : 'video-line'}
                  customSize={-5}
                  style={{ color: 'var(--vera-on-secondary)' }}
                />
              )
            }
          />
        </Tooltip>
      </Box>
      {isBlocked && <DevicePermissionBadge />}
    </span>
  );
};

export default DeviceToggleButton;
