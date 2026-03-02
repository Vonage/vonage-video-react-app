import { KeyboardEvent, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSessionContext from '../../../hooks/useSessionContext';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import useTheme from '@ui/theme';
import VividIcon from '@components/VividIcon';

/**
 * ChatInput component
 *
 * Renders a text input with a send button
 * and sends message via signaling on send.
 * @returns {ReactElement} - ChatInput component
 */
const ChatInput = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [text, setText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const { sendChatMessage } = useSessionContext();

  const handleSendMessage = () => {
    // Ensure composition has ended before sending the message
    if (isComposing) {
      return;
    }
    const trimmedText = text.trim();
    if (trimmedText.length) {
      sendChatMessage(trimmedText);
    }
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // If enter press then send message unless shift also pressed to allow for multiline messages
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  return (
    <TextField
      name="Solid"
      multiline
      variant="standard"
      placeholder={t('chat.input.placeholder')}
      onKeyDown={handleKeyDown}
      onChange={(e) => setText(e.target.value)}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      value={text}
      maxRows={5}
      fullWidth
      sx={{
        margin: '16px',
        minHeight: '48px',
        borderRadius: theme.shapes.borderRadiusExtraLarge,
        backgroundColor: theme.colors.background,
        flexDirection: 'row',
        '&.MuiTextField-root': {
          paddingLeft: '24px',
        },
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton sx={{ height: '40px' }} onClick={handleSendMessage}>
              <VividIcon
                name="message-sent-solid"
                customSize={-5}
                sx={{ color: text === '' ? theme.colors.disabled : theme.colors.primary }}
                data-testid="SendIcon"
              />
            </IconButton>
          </InputAdornment>
        ),
        disableUnderline: true,
      }}
    />
  );
};

export default ChatInput;
