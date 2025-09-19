import { Avatar, ListItem, ListItemText, Typography } from '@mui/material';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { getFormattedTime } from '../../../utils/dateTime';
import FormattedMessageBody from '../FormattedMessageBody';

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
              sx={{ color: 'text.primary', display: 'inline' }}
              data-testid="chat-msg-participant-name"
            >
              {name}
            </Typography>
            <Typography
              component="span"
              variant="body2"
              sx={{ paddingLeft: '8px', color: 'text.secondary', display: 'inline' }}
              data-testid="chat-msg-timestamp"
            >
              {getFormattedTime(i18n.language, timestamp)}
            </Typography>
          </>
        }
        secondary={
          <Typography variant="body2" sx={{ color: 'text.secondary', overflowWrap: 'break-word' }}>
            <FormattedMessageBody message={message} />
          </Typography>
        }
      />
    </ListItem>
  );
};

export default ChatMessage;
