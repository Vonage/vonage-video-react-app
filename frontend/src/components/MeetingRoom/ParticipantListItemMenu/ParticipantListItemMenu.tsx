import { useState, MouseEvent, ReactElement } from 'react';
import { ClickAwayListener, Grow, IconButton, Paper, Popper } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
// import { ClickAwayListener, Popper, PopperChildrenProps } from '@mui/base';
import { PopperChildrenProps } from '@mui/base';
import { SubscriberWrapper } from '../../../types/session';
import ParticipantPinMenuItem from './ParticipantPinMenuItem';

export type ParticipantListItemMenuProps = {
  participantName: string;
  subscriberWrapper: SubscriberWrapper;
};
/**
 * ParticipantListItemMenu
 * renders a kebab menu button which opens a menu containing a
 * button to pin the participant.
 * @param {ParticipantListItemMenuProps} props - component props.
 *  @property {string} participantName - participant name.
 *  @property {SubscriberWrapper} subscriberWrapper -  The SubscriberWrapper for the participant.
 * @returns {ReactElement} - ParticipantListItemMenu
 */
const ParticipantListItemMenu = ({
  participantName,
  subscriberWrapper,
}: ParticipantListItemMenuProps): ReactElement => {
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
      <Popper open={isOpen} anchorEl={anchorEl} placement="bottom-start">
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            elevation={4}
            sx={{
              paddingTop: 1,
              paddingBottom: 1,
              borderRadius: 1,
              position: 'relative',
            }}
          >
            <ParticipantPinMenuItem
              handleClick={handleClose}
              subscriberWrapper={subscriberWrapper}
              participantName={participantName}
            />
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default ParticipantListItemMenu;
