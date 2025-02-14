import React from 'react';
import { IconButton, Menu } from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import PushPinOffIcon from '../../Icons/PushPinOffIcon';
import { SubscriberWrapper } from '../../../types/session';
import useSessionContext from '../../../hooks/useSessionContext';

const truncateString = (str: string, maxLength: number) => {
  if (str.length > maxLength) {
    return `${str.slice(0, maxLength - 3)}...`;
  }
  return str;
};

type ParticipantListItemMenuToggleButtonProps = {
  participantName: string;
  subscriberWrapper: SubscriberWrapper;
};

const ParticipantListItemMenuToggleButton = ({
  participantName,
  subscriberWrapper,
}: ParticipantListItemMenuToggleButtonProps) => {
  const { isPinned, id } = subscriberWrapper;
  const { isMaxPinned, pinSubscriber } = useSessionContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const trimmedName = truncateString(participantName, 22);

  const getText = () => {
    if (isPinned) {
      return `Unpin ${trimmedName}`;
    }
    if (isMaxPinned) {
      return `You can't pin any more tiles`;
    }
    return `Pin ${trimmedName}`;
  };
  const handlePinClick = () => {
    pinSubscriber(id);
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
        <MenuItem
          disabled={!isPinned && isMaxPinned}
          sx={{ width: '280px' }}
          onClick={handlePinClick}
        >
          <ListItemIcon>
            {isPinned ? (
              <PushPinOffIcon fontSize="small" sx={{ color: 'black' }} />
            ) : (
              <PushPinIcon fontSize="small" sx={{ color: 'black' }} />
            )}
          </ListItemIcon>
          <ListItemText sx={{ maxWidth: '200px' }}>{getText()}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ParticipantListItemMenuToggleButton;
