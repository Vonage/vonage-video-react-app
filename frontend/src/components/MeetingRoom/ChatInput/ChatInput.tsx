import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import { IconButton, InputAdornment } from '@mui/material';
import { KeyboardEvent, ReactElement, useState } from 'react';
import { blue } from '@mui/material/colors';
import { useTranslation } from 'react-i18next';
import useSessionContext from '../../../hooks/useSessionContext';

/**
 * ChatInput component
 *
 * Renders a text input with a send button
 * and sends message via signaling on send.
 * @returns {ReactElement} - ChatInput component
 */
const ChatInput = (): ReactElement => {
  const { t } = useTranslation();
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
        borderRadius: '25px',
        backgroundColor: '#F1F3F4',
        flexDirection: 'row',
        '&.MuiTextField-root': {
          paddingLeft: '24px',
        },
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton sx={{ height: '40x' }} onClick={handleSendMessage}>
              <SendIcon sx={{ color: text !== '' ? blue.A100 : '#B2B4B6' }} />
            </IconButton>
          </InputAdornment>
        ),
        disableUnderline: true,
      }}
    />
  );
};

export default ChatInput;
