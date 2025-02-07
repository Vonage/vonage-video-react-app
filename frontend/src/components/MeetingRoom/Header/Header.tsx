import { ReactElement } from 'react';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { ContentCopy } from '@mui/icons-material';
import useSessionContext from '../../../hooks/useSessionContext';
import useRoomName from '../../../hooks/useRoomName';

const Header = (): ReactElement => {
  const { archiveId } = useSessionContext();
  const isRecording = !!archiveId;
  const roomName = useRoomName();
  return (
    <div className="flex items-center justify-between px-4 py-6 bg-darkGray-100 text-white">
      <div className="flex items-center space-x-4">
        {isRecording && <RadioButtonCheckedIcon className="text-red-500" />}
        <div className="flex-grow truncate">{roomName}</div>
      </div>
      <ContentCopy className="cursor-pointer text-white" />
    </div>
  );
};

export default Header;
