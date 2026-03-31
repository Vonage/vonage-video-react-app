import { useState, useRef, useCallback, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import usePublisherContext from '@hooks/usePublisherContext';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';
import getControlButtonTooltip from '@utils/getControlButtonTooltip';
import useTheme from '@ui/theme';
import DeviceSettingsMenu from '../DeviceSettingsMenu';
import MutedAlert from '../../MutedAlert';
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VividIcon from '@components/VividIcon';
import Box from '@mui/material/Box';
import usePushToTalk from '@hooks/usePushToTalk';
import { env } from '../../../env';

export type DeviceControlButtonProps = {
  deviceType: 'audio' | 'video';
  toggleBackgroundEffects: () => void;
};

/**
 * DeviceControlButton Component
 *
 * This component displays a current status of audio/video device (camera/microphone enabled/disabled)
 * and shows a dropdown that displays available audio/video devices.
 * @param {DeviceControlButtonProps} props - the props for the component.
 *  @property {boolean} deviceType - indicates the type of the device to control.
 *  @property {Function} toggleBackgroundEffects - function to toggle background effects for video devices.
 * @returns {ReactElement} The DeviceControlButton component.
 */
const DeviceControlButton = ({
  deviceType,
  toggleBackgroundEffects,
}: DeviceControlButtonProps): ReactElement => {
  const { t } = useTranslation();
  const { isVideoEnabled, toggleAudio, toggleVideo, isAudioEnabled } = usePublisherContext();
  const { toggleVideo: toggleBackgroundVideoPublisher } = useBackgroundPublisherContext();
  const theme = useTheme();

  const isAudio = deviceType === 'audio';
  const [open, setOpen] = useState<boolean>(false);
  const anchorRef = useRef<HTMLInputElement | null>(null);
  const isButtonDisabled = isAudio ? !env.ALLOW_MICROPHONE_CONTROL : !env.ALLOW_CAMERA_CONTROL;

  const tooltipTitle = getControlButtonTooltip({
    isAudio,
    isAudioEnabled,
    isVideoEnabled,
    allowMicrophoneControl: env.ALLOW_MICROPHONE_CONTROL,
    allowCameraControl: env.ALLOW_CAMERA_CONTROL,
    t,
  });

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = useCallback((event: MouseEvent | TouchEvent) => {
    if (anchorRef?.current?.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  }, []);

  const renderControlIcon = () => {
    if (isAudio) {
      if (!env.ALLOW_MICROPHONE_CONTROL) {
        return (
          <VividIcon
            name="microphone-2-solid"
            customSize={-5}
            sx={{ color: theme.colors.disabled }}
          />
        );
      }
      if (isAudioEnabled) {
        return (
          <VividIcon
            name="microphone-2-solid"
            customSize={-5}
            data-testid="MicNoneIcon"
            sx={{ color: theme.colors.onDarkGrey }}
          />
        );
      }
      return (
        <VividIcon
          name="mic-mute-solid"
          customSize={-5}
          data-testid="MicOffToolbar"
          sx={{ color: theme.colors.error, transform: 'scaleX(-1)' }}
        />
      );
    }

    if (!env.ALLOW_CAMERA_CONTROL) {
      return <VividIcon name="video-solid" customSize={-5} sx={{ color: theme.colors.disabled }} />;
    }
    if (isVideoEnabled) {
      return (
        <VividIcon
          name="video-solid"
          customSize={-5}
          data-testid="VideocamIcon"
          sx={{ color: theme.colors.onDarkGrey }}
        />
      );
    }
    return (
      <VividIcon
        name="video-off-solid"
        customSize={-5}
        data-testid="VideocamOffIcon"
        sx={{ color: theme.colors.error }}
      />
    );
  };

  const handleDeviceStateChange = () => {
    if (isAudio) {
      toggleAudio();
    } else {
      toggleVideo();
      toggleBackgroundVideoPublisher();
    }
  };

  usePushToTalk({
    enabled: isAudio && env.ALLOW_MICROPHONE_CONTROL,
    isAudioEnabled,
    toggleAudio,
  });

  return (
    <>
      {isAudio && <MutedAlert />}
      <ButtonGroup
        disableElevation
        sx={{
          mr: 2,
          mt: 0.25,
          backgroundColor: theme.colors.darkGrey,
          borderRadius: '30px',
        }}
        variant="contained"
        ref={anchorRef}
        aria-label={t('devices.buttons.ariaLabel')}
      >
        <IconButton
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label={isAudio ? t('devices.audio.ariaLabel') : t('devices.video.ariaLabel')}
          aria-haspopup="menu"
          onClick={handleToggle}
          sx={{ width: 48, height: 48 }}
          data-testid={isAudio ? 'audio-dropdown-button' : 'video-dropdown-button'}
        >
          {open ? (
            <VividIcon
              name="chevron-down-line"
              customSize={-6}
              sx={{ color: theme.colors.onDarkGrey }}
            />
          ) : (
            <VividIcon
              name="chevron-up-line"
              customSize={-6}
              sx={{ color: theme.colors.onDarkGrey }}
            />
          )}
        </IconButton>
        <Tooltip title={tooltipTitle} aria-label={t('devices.settings.ariaLabel')}>
          <Box>
            {/* We add the Box here so that the tooltip is present if the button is disabled */}
            <IconButton
              onClick={handleDeviceStateChange}
              disabled={isButtonDisabled}
              edge="start"
              aria-label={
                isAudio ? t('devices.audio.microphone.full') : t('devices.video.camera.full')
              }
              size="small"
              sx={{
                m: '3px',
                width: 40,
                height: 40,
                borderRadius: '50%',
              }}
            >
              {renderControlIcon()}
            </IconButton>
          </Box>
        </Tooltip>
      </ButtonGroup>
      <DeviceSettingsMenu
        deviceType={deviceType}
        handleToggle={handleToggle}
        toggleBackgroundEffects={toggleBackgroundEffects}
        anchorRef={anchorRef}
        isOpen={open}
        handleClose={handleClose}
        setIsOpen={setOpen}
      />
    </>
  );
};

export default DeviceControlButton;
