import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import { SubscriberWrapper } from '../../../types/session';
import PushPinOffIcon from '../../Icons/PushPinOffIcon';
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

  const getText = () => {
    if (isPinned) {
      return `Unpin ${participantName}`;
    }
    if (isMaxPinned) {
      return `You can't pin any more tiles`;
    }
    return `Pin ${participantName}`;
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
          <PushPinIcon fontSize="small" sx={{ color: 'black' }} />
        )}
      </ListItemIcon>
      <ListItemText
        sx={{
          '.MuiTypography-root': {
            overflow: 'hidden',
            'white-space': 'nowrap',
            'text-overflow': 'ellipsis',
          },
        }}
      >
        {getText()}
      </ListItemText>
    </MenuItem>
  );
};
export default ParticipantPinMenuItem;
