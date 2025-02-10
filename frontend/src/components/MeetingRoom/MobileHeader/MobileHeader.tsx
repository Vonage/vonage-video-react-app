import { ReactElement, useState } from 'react';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { ContentCopy } from '@mui/icons-material';
import { IconButton, Fade } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import useSessionContext from '../../../hooks/useSessionContext';
import useRoomName from '../../../hooks/useRoomName';
import useRoomShareUrl from '../../../hooks/useRoomShareUrl';

/**
 * MobileHeader Component
 *
 * This component shows a header bar in mobile that consists of recording on/off indicator,
 * meeting room name, and copy-to-clipboard button.
 * @returns {ReactElement} The mobile header component.
 */
const MobileHeader = (): ReactElement => {
  const { archiveId } = useSessionContext();
  const isRecording = !!archiveId;
  const roomName = useRoomName();
  const roomShareUrl = useRoomShareUrl();
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const copyUrl = () => {
    navigator.clipboard.writeText(roomShareUrl);

    setIsCopied(true);

    // reset the icon back after a brief timeout
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };
  return (
    <div
      className="flex items-center justify-between px-4 pt-4 bg-darkGray-100 text-white"
      data-testId="mobileHeader"
    >
      <div className="flex items-center space-x-2 px-1">
        {isRecording && <RadioButtonCheckedIcon className="text-red-500" />}
        <div className="line-clamp-1">{roomName}</div>
      </div>
      <div className="-mx-2">
        <Fade in timeout={500}>
          <IconButton
            size="large"
            sx={{ color: 'rgb(95, 99, 104)' }}
            onClick={copyUrl}
            disabled={isCopied}
          >
            {isCopied ? (
              <CheckIcon sx={{ color: 'rgba(26,115,232,.9)' }} />
            ) : (
              <ContentCopy className="text-white" />
            )}
          </IconButton>
        </Fade>
      </div>
    </div>
  );
};

export default MobileHeader;
