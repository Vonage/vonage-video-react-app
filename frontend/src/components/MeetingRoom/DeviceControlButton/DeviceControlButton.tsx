import Mic from '@mui/icons-material/MicNone';
import { IconButton } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import Tooltip from '@mui/material/Tooltip';
import ButtonGroup from '@mui/material/ButtonGroup';
import { MicOff, ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { useState, useRef, useCallback, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import useIsMicrophoneControlAllowed from '@Context/AppConfig/hooks/useIsMicrophoneControlAllowed';
import useIsCameraControlAllowed from '@Context/AppConfig/hooks/useIsCameraControlAllowed';
import usePublisherContext from '@hooks/usePublisherContext';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';
import getControlButtonTooltip from '@utils/getControlButtonTooltip';
import DeviceSettingsMenu from '../DeviceSettingsMenu';
import MutedAlert from '../../MutedAlert';
import { colors } from '../../../utils/customTheme/customTheme';

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

  const isMicrophoneControlAllowed = useIsMicrophoneControlAllowed();
  const isCameraControlAllowed = useIsCameraControlAllowed();

  const isAudio = deviceType === 'audio';
  const [open, setOpen] = useState<boolean>(false);
  const anchorRef = useRef<HTMLInputElement | null>(null);
  const isButtonDisabled = isAudio ? !isMicrophoneControlAllowed : !isCameraControlAllowed;

  const tooltipTitle = getControlButtonTooltip({
    isAudio,
    isAudioEnabled,
    isVideoEnabled,
    allowMicrophoneControl: isMicrophoneControlAllowed,
    allowCameraControl: isCameraControlAllowed,
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
      if (!isMicrophoneControlAllowed) {
        return <Mic className="text-gray-400" />;
      }
      if (isAudioEnabled) {
        return <Mic className="text-white" />;
      }
      return <MicOff data-testid="MicOffToolbar" className="text-red-600" />;
    }

    if (!isCameraControlAllowed) {
      return <VideocamIcon className="text-gray-400" />;
    }
    if (isVideoEnabled) {
      return <VideocamIcon className="text-white" />;
    }
    return <VideocamOffIcon className="text-red-500" />;
  };

  const handleDeviceStateChange = () => {
    if (isAudio) {
      toggleAudio();
    } else {
      toggleVideo();
      toggleBackgroundVideoPublisher();
    }
  };

  return (
    <>
      {isAudio && <MutedAlert />}
      <ButtonGroup
        className="mr-3 mt-1 bg-notVeryGray-55"
        disableElevation
        sx={{ borderRadius: '30px' }}
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
          className="size-12"
          data-testid={isAudio ? 'audio-dropdown-button' : 'video-dropdown-button'}
        >
          {open ? (
            <ArrowDropDown sx={{ color: colors.primaryLight }} />
          ) : (
            <ArrowDropUp className="text-gray-400" />
          )}
        </IconButton>
        <Tooltip title={tooltipTitle} aria-label={t('devices.settings.ariaLabel')}>
          <div>
            {/* We add the div here so that the tooltip is present if the button is disabled */}
            <IconButton
              onClick={handleDeviceStateChange}
              disabled={isButtonDisabled}
              edge="start"
              aria-label={
                isAudio ? t('devices.audio.microphone.full') : t('devices.video.camera.full')
              }
              size="small"
              className="m-[3px] size-[50px] rounded-full shadow-md"
            >
              {renderControlIcon()}
            </IconButton>
          </div>
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
