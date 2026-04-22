import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { getFormattedTime } from '../../../utils/dateTime';
import FormattedMessageBody from '../FormattedMessageBody';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

export type ChatMessageProps = {
  avatarColor: string;
  initials: string;
  message: string;
  name: string;
  timestamp: number;
};
/**
 * ChatMessage component
 *
 * Renders an MUI ListItem with a chat message.
 * For each message, it renders an Avatar with initials, the sender name, a formatted time, and the message.
 * @param {ChatMessageProps} props - props for the component
 *  @property {string} avatarColor - color for avatar
 *  @property {string} initials - initials for avatar
 *  @property {string} message - chat message contents
 *  @property {string} name - sender name
 *  @property {number} timestamp - message timestamp
 * @returns {ReactElement} the ChatMessage Component
 */
const ChatMessage = ({
  avatarColor,
  initials,
  message,
  name,
  timestamp,
}: ChatMessageProps): ReactElement => {
  const { i18n } = useTranslation();

  return (
    <ListItem alignItems="flex-start" data-testid="chat-message">
      <Avatar
        sx={{
          bgcolor: avatarColor,
          marginTop: '4px',
          width: '32px',
          height: '32px',
          fontSize: '14px',
        }}
      >
        {initials}
      </Avatar>
      <ListItemText
        sx={{ marginLeft: '12px', marginTop: 0 }}
        primary={
          <>
            <Typography
              component="span"
              variant="body2"
              className="text-vera-text-secondary"
              sx={{ display: 'inline' }}
              data-testid="chat-msg-participant-name"
            >
              {name}
            </Typography>
            <Typography
              component="span"
              variant="body2"
              className="text-vera-text-secondary"
              sx={{ paddingLeft: '8px', display: 'inline' }}
              data-testid="chat-msg-timestamp"
            >
              {getFormattedTime(i18n.language, timestamp)}
            </Typography>
          </>
        }
        secondary={
          <Typography
            variant="body2"
            component="span"
            className="text-vera-text-secondary"
            sx={{ overflowWrap: 'break-word' }}
            data-testid="chat-msg-content"
          >
            <FormattedMessageBody message={message} />
          </Typography>
        }
      />
    </ListItem>
  );
};

export default ChatMessage;
