import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import useSessionContext from '../../../hooks/useSessionContext';
import useRoomName from '../../../hooks/useRoomName';
import useRoomShareUrl from '../../../hooks/useRoomShareUrl';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import VividIcon from '@components/VividIcon';
import useCameraToggle from '@hooks/useCameraToggle';
import RecordingIndicator from '../RecordingIndicator';

/**
 * SmallViewportHeader Component
 *
 * This component shows a header bar in smaller viewport devices that consists of recording on/off indicator,
 * meeting room name, and copy-to-clipboard button.
 * @returns {ReactElement} The small viewport header component.
 */
const SmallViewportHeader = (): ReactElement => {
  const { t } = useTranslation();
  const { archiveId } = useSessionContext();
  const isRecording = !!archiveId;
  const roomName = useRoomName();

  const { canSwitch: canSwitchCamera, handleToggle: handleCameraToggle } = useCameraToggle();

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

  return (
    <Box
      data-testid="smallViewportHeader"
      className="flex items-center justify-between bg-vera-dark-background px-4 pt-2 text-vera-on-dark-grey"
    >
      <Box className="flex min-w-0 items-center gap-1 px-0.5">
        {isRecording && <RecordingIndicator isCompact />}
        <Box className="ml-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          {roomName}
        </Box>
      </Box>
      <Box className="-mx-1 flex items-center gap-1">
        {canSwitchCamera && (
          <Tooltip title={t('devices.video.camera.switch')} placement="bottom">
            <IconButton className="text-vera-on-dark-grey" onClick={handleCameraToggle}>
              <VividIcon
                name="camera-switch-line"
                customSize={-4}
                className="text-vera-on-dark-grey"
              />
            </IconButton>
          </Tooltip>
        )}
        <Fade in timeout={500}>
          <Tooltip title={isCopied ? t('chat.copied') : t('chat.copy')} placement="bottom">
            <Box>
              <IconButton className="text-vera-on-dark-grey" onClick={copyUrl} disabled={isCopied}>
                {isCopied ? (
                  <VividIcon customSize={-4} name="check-sent-line" className="text-vera-success" />
                ) : (
                  <VividIcon customSize={-4} name="copy-line" className="text-vera-on-dark-grey" />
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
