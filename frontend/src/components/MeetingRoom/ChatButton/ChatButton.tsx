import ChatIcon from '@mui/icons-material/Chat';
import Tooltip from '@mui/material/Tooltip';
import { blue } from '@mui/material/colors';
import { ReactElement } from 'react';
import ToolbarButton from '../ToolbarButton';
import UnreadMessagesBadge from '../UnreadMessagesBadge';
import useSessionContext from '../../../hooks/useSessionContext';

export type ChatButtonProps = {
  handleClick: () => void;
  isOverflowButton?: boolean;
};

/**
 * ChatButton Component
 *
 * Toolbar button to open and close the chat panel.
 * Also displays an unread message count badge.
 * @param {ChatButtonProps} props - the props for this component
 *   @property {() => void} handleClick - click handler to toggle open chat panel
 *   @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 * @returns {ReactElement} - ChatButton
 */
const ChatButton = ({ handleClick, isOverflowButton = false }: ChatButtonProps): ReactElement => {
  const { rightPanelActiveTab } = useSessionContext();
  const isOpen = rightPanelActiveTab === 'chat';

  return (
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
  );
};

export default ChatButton;
