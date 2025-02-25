import ChatIcon from '@mui/icons-material/Chat';
import Tooltip from '@mui/material/Tooltip';
import { blue } from '@mui/material/colors';
import { Badge } from '@mui/material';
import { ReactElement } from 'react';
import ToolbarButton from '../ToolbarButton';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type ChatToggleButtonProps = {
  handleClick: () => void;
  isOpen: boolean;
  unreadCount: number;
};

/**
 * ChatToggleButton Component
 *
 * Toolbar button to open and close the chat panel.
 * Also displays an unread message count badge.
 * @param {ChatToggleButtonProps} props - the props for this component
 *   @property {() => void} handleClick - click handler to toggle open chat panel
 *   @property {boolean} isOpen - true if chat is currently open, false if not
 *   @property {number} unreadCount - number of unread message, to be displayed in badge if non-zero
 * @returns {ReactElement} - ChatToggleButton
 */
const ChatToggleButton = ({
  handleClick,
  isOpen,
  unreadCount,
}: ChatToggleButtonProps): ReactElement => {
  const isSmallViewport = useIsSmallViewport();
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
          data-testid="chat-toggle"
          sx={{
            marginTop: '0px',
            marginRight: '0px',
          }}
          onClick={handleClick}
          icon={<ChatIcon sx={{ color: isOpen ? blue.A100 : 'white' }} />}
          isSmallViewPort={isSmallViewport}
        />
      </Badge>
    </Tooltip>
  );
};

export default ChatToggleButton;
