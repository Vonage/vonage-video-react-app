import { useState, MouseEvent, ReactElement } from 'react';
import { SubscriberWrapper } from '../../../types/session';
import ParticipantPinMenuItem from './ParticipantPinMenuItem';
import IconButton from '@mui/material/IconButton';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import VividIcon from '@components/VividIcon';
import useTheme from '@ui/theme';

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
  const theme = useTheme();
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
        <VividIcon
          name="more-vertical-solid"
          customSize={-6}
          color={theme.colors.tertiary}
          data-testid="MoreVertIcon"
        />
      </IconButton>
      <Popper open={isOpen} anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: 10 }}>
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
