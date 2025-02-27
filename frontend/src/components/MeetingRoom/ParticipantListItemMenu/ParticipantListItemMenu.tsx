import { useState, MouseEvent } from 'react';
import { IconButton, Menu } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { SubscriberWrapper } from '../../../types/session';
import ParticipantPinMenuItem from './ParticipantPinMenuItem';

export type ParticipantListItemMenuProps = {
  participantName: string;
  subscriberWrapper: SubscriberWrapper;
};

const ParticipantListItemMenu = ({
  participantName,
  subscriberWrapper,
}: ParticipantListItemMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = !!anchorEl;
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
        open={isOpen}
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

export default ParticipantListItemMenu;
