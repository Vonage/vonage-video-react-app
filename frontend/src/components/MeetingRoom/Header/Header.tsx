import { ReactElement, useState } from 'react';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { ContentCopy } from '@mui/icons-material';
import { IconButton, Tooltip, Fade } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import useSessionContext from '../../../hooks/useSessionContext';
import useRoomName from '../../../hooks/useRoomName';
import useRoomShareUrl from '../../../hooks/useRoomShareUrl';

const Header = (): ReactElement => {
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
    <div className="flex items-center justify-between px-4 py-6 bg-darkGray-100 text-white">
      <div className="flex items-center space-x-1">
        {isRecording && <RadioButtonCheckedIcon className="text-red-500" />}
        <div className="line-clamp-1">{roomName}</div>
      </div>
      <IconButton
        size="large"
        sx={{ color: 'rgb(95, 99, 104)' }}
        onClick={copyUrl}
        disabled={isCopied}
      >
        <Tooltip title="" TransitionComponent={Fade} TransitionProps={{ timeout: 500 }}>
          {isCopied ? (
            <CheckIcon sx={{ color: 'rgba(26,115,232,.9)' }} />
          ) : (
            <ContentCopy className="text-white" />
          )}
        </Tooltip>
      </IconButton>
    </div>
  );
};

export default Header;
