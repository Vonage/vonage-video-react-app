import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ToolbarButton from '../ToolbarButton';
import UnreadMessagesBadge from '../UnreadMessagesBadge';
import Tooltip from '@mui/material/Tooltip';
import useTheme from '@ui/theme';
import VividIcon from '@components/VividIcon';
import { env } from '../../../env';

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
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    env.ALLOW_CHAT && (
      <Tooltip title={isOpen ? t('chat.close') : t('chat.open')} aria-label={t('chat.ariaLabel')}>
        <UnreadMessagesBadge>
          <ToolbarButton
            data-testid="chat-button"
            sx={{
              marginTop: '0px',
              marginRight: '0px',
            }}
            onClick={handleClick}
            icon={
              <VividIcon
                customSize={-5}
                name="chat-solid"
                sx={{ color: isOpen ? theme.colors.secondary : theme.colors.onSecondary }}
                data-testid="ChatIcon"
              />
            }
            isOverflowButton={isOverflowButton}
          />
        </UnreadMessagesBadge>
      </Tooltip>
    )
  );
};

export default ChatButton;
