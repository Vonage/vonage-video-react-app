import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import useTheme from '@ui/theme';
import useSessionContext from '../../../hooks/useSessionContext';
import useRoomName from '../../../hooks/useRoomName';
import useRoomShareUrl from '../../../hooks/useRoomShareUrl';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import VividIcon from '@components/VividIcon';
import usePublisherContext from '@hooks/usePublisherContext';
import { isRearFacingLabel, isFrontFacingLabel } from '@utils/cameraSwitch';
import usePreferredCameras from '@hooks/usePreferredCameras';

/**
 * SmallViewportHeader Component
 *
 * This component shows a header bar in smaller viewport devices that consists of recording on/off indicator,
 * meeting room name, and copy-to-clipboard button.
 * @returns {ReactElement} The small viewport header component.
 */
const SmallViewportHeader = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { archiveId } = useSessionContext();
  const isRecording = !!archiveId;
  const roomName = useRoomName();

  // Get preferred video input devices (cameras)
  const videoInputDevices = usePreferredCameras();

  const roomShareUrl = useRoomShareUrl();
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const copyUrl = () => {
    void navigator.clipboard.writeText(roomShareUrl);

    setIsCopied(true);

    // reset the icon back after a brief timeout
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const { publisher, isVideoEnabled } = usePublisherContext();

  const handleCameraToggle = () => {
    if (!publisher) return;

    const currentSource = publisher.getVideoSource?.();

    const currentDevice = videoInputDevices.find((d) => d.deviceId === currentSource?.deviceId);
    const currentIsFront = isFrontFacingLabel(currentDevice?.label);

    const pickFront = () =>
      videoInputDevices.find((d) => isFrontFacingLabel(d.label)) ||
      videoInputDevices.find((d) => d.deviceId !== currentSource?.deviceId);

    const pickRear = () =>
      videoInputDevices.find((d) => isRearFacingLabel(d.label)) ||
      videoInputDevices.find(
        (d) => !isFrontFacingLabel(d.label) && d.deviceId !== currentSource?.deviceId
      );

    const target = currentIsFront ? pickRear() : pickFront();

    if (target?.deviceId && target.deviceId !== currentSource?.deviceId) {
      void publisher.setVideoSource(target.deviceId);
    }
  };

  return (
    <Box
      data-testid="smallViewportHeader"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.darkBackground,
        paddingX: 2,
        paddingTop: 2,
        color: theme.colors.onDarkGrey,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, paddingX: 0.5 }}>
        {isRecording && (
          <VividIcon
            name="radio-checked-2-solid"
            customSize={-6}
            sx={{ color: theme.colors.error }}
            data-testid="RadioButtonCheckedIcon"
          />
        )}
        <Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {roomName}
        </Box>
      </Box>
      <Box sx={{ marginX: -1, display: 'flex', alignItems: 'center', gap: 1 }}>
        {isVideoEnabled && videoInputDevices.length > 1 && (
          <Tooltip title={t('devices.video.camera.switch')} placement="bottom">
            <IconButton sx={{ color: theme.colors.onDarkGrey }} onClick={handleCameraToggle}>
              <VividIcon name="camera-switch-line" customSize={-4} />
            </IconButton>
          </Tooltip>
        )}
        <Fade in timeout={500}>
          <Tooltip title={isCopied ? t('chat.copied') : t('chat.copy')} placement="bottom">
            <Box>
              <IconButton
                sx={{ color: theme.colors.onDarkGrey }}
                onClick={copyUrl}
                disabled={isCopied}
              >
                {isCopied ? (
                  <VividIcon
                    customSize={-4}
                    name="check-sent-line"
                    sx={{ color: theme.colors.success }}
                  />
                ) : (
                  <VividIcon
                    customSize={-4}
                    name="copy-line"
                    sx={{ color: theme.colors.onDarkGrey }}
                  />
                )}
              </IconButton>
            </Box>
          </Tooltip>
        </Fade>
      </Box>
    </Box>
  );
};

export default SmallViewportHeader;
