import ChatIcon from '@mui/icons-material/Chat';
import Tooltip from '@mui/material/Tooltip';
import { blue } from '@mui/material/colors';
import { Badge } from '@mui/material';
import { ReactElement } from 'react';
import ToolbarButton from '../ToolbarButton';
import useSessionContext from '../../../hooks/useSessionContext';

/**
 * ChatToggleButton Component
 *
 * Toolbar button to open and close the chat panel.
 * Also displays an unread message count badge.
 * @returns {ReactElement} - ChatToggleButton
 */
const ChatToggleButton = (): ReactElement => {
  const { toggleChat, rightPanelActiveTab, unreadCount } = useSessionContext();
  const isOpen = rightPanelActiveTab === 'chat';

  return (
    <Tooltip title={isOpen ? 'Close chat' : 'Open chat'} aria-label="toggle chat">
      <Badge
        badgeContent={unreadCount}
        data-testid="chat-toggle-unread-count"
        invisible={unreadCount === 0}
        sx={{
          '& .MuiBadge-badge': {
            color: 'white',
            backgroundColor: '#FA7B17',
          },
        }}
        overlap="circular"
      >
        <ToolbarButton
          sx={{
            marginTop: '0px',
            marginRight: '0px',
          }}
          onClick={toggleChat}
          icon={<ChatIcon sx={{ color: isOpen ? blue.A100 : 'white' }} />}
        />
      </Badge>
    </Tooltip>
  );
};

export default ChatToggleButton;
