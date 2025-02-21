import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { SubscriberWrapper } from '../../../types/session';
import PushPinOffIcon from '../../Icons/PushPinOffIcon';
import truncateString from '../../../utils/truncateString';
import useSessionContext from '../../../hooks/useSessionContext';

type ParticipantPinMenuItemProps = {
  participantName: string;
  subscriberWrapper: SubscriberWrapper;
};

const ParticipantPinMenuItem = ({
  participantName,
  subscriberWrapper,
}: ParticipantPinMenuItemProps) => {
  const { isPinned, id } = subscriberWrapper;
  const { isMaxPinned, pinSubscriber } = useSessionContext();
  const isDisabled = !isPinned && isMaxPinned;

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
    if (!isDisabled) {
      pinSubscriber(id);
    }
  };
  return (
    <MenuItem disabled={isDisabled} sx={{ width: '280px' }} onClick={handlePinClick}>
      <ListItemIcon>
        {isPinned ? (
          <PushPinOffIcon fontSize="small" sx={{ color: 'black' }} />
        ) : (
          <PushPinOffIcon fontSize="small" sx={{ color: 'black' }} />
        )}
      </ListItemIcon>
      <ListItemText sx={{ maxWidth: '200px' }}>{getText()}</ListItemText>
    </MenuItem>
  );
};
export default ParticipantPinMenuItem;
