import ChatIcon from '@mui/icons-material/Chat';
import Tooltip from '@mui/material/Tooltip';
import { blue } from '@mui/material/colors';
import { ReactElement } from 'react';
import ToolbarButton from '../ToolbarButton';
import UnreadMessagesBadge from '../UnreadMessagesBadge';
import useConfigContext from '../../../hooks/useConfigContext';

export type ChatButtonProps = {
  handleClick: () => void;
  isOpen: boolean;
  isOverflowButton?: boolean;
};

/**
 * ChatButton Component
 *
 * Toolbar button to open and close the chat panel.
 * Also displays an unread message count badge.
 * @param {ChatButtonProps} props - the props for this component
 *   @property {() => void} handleClick - click handler to toggle open chat panel
 *   @property {boolean} isOpen - true if chat is currently open, false if not
 *   @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 * @returns {ReactElement | false} - ChatButton
 */
const ChatButton = ({
  handleClick,
  isOpen,
  isOverflowButton = false,
}: ChatButtonProps): ReactElement | false => {
  const { meetingRoomSettings } = useConfigContext();

  return (
    meetingRoomSettings.showChatButton && (
      <Tooltip title={isOpen ? 'Close chat' : 'Open chat'} aria-label="toggle chat">
        <UnreadMessagesBadge>
          <ToolbarButton
            data-testid="chat-button"
            sx={{
              marginTop: '0px',
              marginRight: '0px',
            }}
            onClick={handleClick}
            icon={<ChatIcon sx={{ color: isOpen ? blue.A100 : 'white' }} />}
            isOverflowButton={isOverflowButton}
          />
        </UnreadMessagesBadge>
      </Tooltip>
    )
  );
};

export default ChatButton;
