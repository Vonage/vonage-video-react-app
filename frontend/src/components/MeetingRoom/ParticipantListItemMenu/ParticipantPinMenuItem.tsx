import { ReactElement } from 'react';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import { useTranslation } from 'react-i18next';
import { SubscriberWrapper } from '../../../types/session';
import PushPinOffIcon from '../../Icons/PushPinOffIcon';
import useSessionContext from '../../../hooks/useSessionContext';

export type ParticipantPinMenuItemProps = {
  handleClick: () => void;
  participantName: string;
  subscriberWrapper: SubscriberWrapper;
};

/**
 * ParticipantPinMenuItem
 * renders a MenuItem button to pin or unpin a participant
 * @param {ParticipantPinMenuItemProps} props - component props.
 *  @property {Function} handleClick - click handler for item
 *  @property {string} participantName - participant name.
 *  @property {SubscriberWrapper} subscriberWrapper -  The SubscriberWrapper for the participant.
 * @returns {ReactElement} - ParticipantPinMenuItem
 */
const ParticipantPinMenuItem = ({
  handleClick,
  participantName,
  subscriberWrapper,
}: ParticipantPinMenuItemProps): ReactElement => {
  const { t } = useTranslation();
  const { isPinned, id } = subscriberWrapper;
  const { isMaxPinned, pinSubscriber } = useSessionContext();
  const isDisabled = !isPinned && isMaxPinned;

  const getText = () => {
    if (isPinned) {
      return t('participants.unpin', { participantName });
    }
    if (isMaxPinned) {
      return t('participants.maxPin');
    }
    return t('participants.pin', { participantName });
  };
  const handlePinClick = () => {
    if (!isDisabled) {
      pinSubscriber(id);
    }
    handleClick();
  };
  return (
    <MenuItem
      data-testid="pin-menu-item"
      disabled={isDisabled}
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
      <ListItemText
        sx={{
          '.MuiTypography-root': {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          },
        }}
      >
        {getText()}
      </ListItemText>
    </MenuItem>
  );
};
export default ParticipantPinMenuItem;
