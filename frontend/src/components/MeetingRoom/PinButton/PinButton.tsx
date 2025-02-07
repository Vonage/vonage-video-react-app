import PushPinIcon from '@mui/icons-material/PushPin';
import { IconButton, Tooltip } from '@mui/material';
import { ReactElement } from 'react';

export type PinButtonProps = {
  pinStyle?: string;
  color?: string;
  participantName?: string;
  isPinned: boolean;
  toggleIsPinned: () => void;
};

const PinButton = ({
  isPinned,
  toggleIsPinned,
  pinStyle,
  color,
  participantName,
}: PinButtonProps): ReactElement | false => {
  const sxProperties = {
    fontSize: '18px',
    color,
    cursor: 'pointer',
  };
  const handleClick = () => {
    toggleIsPinned();
  };

  return (
    <div className={pinStyle} data-testid="pin-button">
      <Tooltip
        title={isPinned ? `Unpin ${participantName}'s video` : `Pin ${participantName}'s video`}
      >
        <IconButton
          onClick={handleClick}
          sx={{
            height: 24,
            width: 24,
            borderRadius: '50%',
            cursor: 'pointer',
          }}
        >
          <PushPinIcon sx={sxProperties} />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default PinButton;
