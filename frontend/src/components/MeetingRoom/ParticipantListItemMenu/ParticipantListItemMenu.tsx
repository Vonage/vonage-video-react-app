import { useState, MouseEvent } from 'react';
import { IconButton, Menu } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { SubscriberWrapper } from '../../../types/session';
import ParticipantPinMenuItem from './ParticipantPinMenuItem';

type ParticipantListItemMenuToggleButtonProps = {
  participantName: string;
  subscriberWrapper: SubscriberWrapper;
};

const ParticipantListItemMenuToggleButton = ({
  participantName,
  subscriberWrapper,
}: ParticipantListItemMenuToggleButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick} sx={{ marginRight: '-8px' }}>
        <MoreVertIcon sx={{ fontSize: '18px' }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{
          vertical: 'top',
          horizontal: 250,
        }}
      >
        <ParticipantPinMenuItem
          subscriberWrapper={subscriberWrapper}
          participantName={participantName}
        />
      </Menu>
    </>
  );
};

export default ParticipantListItemMenuToggleButton;
