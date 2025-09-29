import ChatIcon from '@mui/icons-material/Chat';
import Tooltip from '@mui/material/Tooltip';
import { blue } from '@mui/material/colors';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ToolbarButton from '../ToolbarButton';
import UnreadMessagesBadge from '../UnreadMessagesBadge';

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
 * @returns {ReactElement} - ChatButton
 */
const ChatButton = ({
  handleClick,
  isOpen,
  isOverflowButton = false,
}: ChatButtonProps): ReactElement => {
  const { t } = useTranslation();
  return (
    <Tooltip title={isOpen ? t('chat.close') : t('chat.open')} aria-label={t('chat.ariaLabel')}>
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
