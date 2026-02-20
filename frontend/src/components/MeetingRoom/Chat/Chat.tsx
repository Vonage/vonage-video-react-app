import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import getInitials from '../../../utils/getInitials';
import getParticipantColor from '../../../utils/getParticipantColor';
import ChatMessage from '../ChatMessage';
import ChatInput from '../ChatInput';
import useSessionContext from '../../../hooks/useSessionContext';
import RightPanelTitle from '../RightPanel/RightPanelTitle';
import List from '@mui/material/List';
import Box from '@mui/material/Box';

export type ChatProps = {
  handleClose: () => void;
  isOpen: boolean;
};

/**
 * Chat component
 * Renders a scrollable chat container
 * @param {ChatProps} props - props for this component
 *  @property {() => void} handleClose - close handler
 *  @property {boolean} isOpen - true if chat is open
 * @returns {ReactElement | false} - Chat component
 */
const Chat = ({ handleClose, isOpen }: ChatProps): ReactElement | false => {
  const { t } = useTranslation();
  const { messages } = useSessionContext();

  return (
    isOpen && (
      <>
        <RightPanelTitle title={t('chat.title')} handleClose={handleClose} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column-reverse',
            overflowY: 'auto',
            height: 'calc(100dvh - 240px)',
          }}
        >
          <List>
            {messages.map((msg) => {
              return (
                <ChatMessage
                  key={msg.timestamp}
                  name={msg.participantName}
                  message={msg.message}
                  initials={getInitials(msg.participantName)}
                  avatarColor={getParticipantColor(msg.participantName)}
                  timestamp={msg.timestamp}
                />
              );
            })}
          </List>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
          }}
        >
          <ChatInput />
        </Box>
      </>
    )
  );
};

export default Chat;
