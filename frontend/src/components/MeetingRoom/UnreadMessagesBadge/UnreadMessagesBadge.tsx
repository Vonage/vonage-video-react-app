import { Badge } from '@mui/material';
import { ReactElement } from 'react';
import useSessionContext from '../../../hooks/useSessionContext';

export type UnreadMessagesBadgeProps = {
  children: ReactElement;
};

/**
 * UnreadMessagesBadge Component
 *
 * Displays a badge indicating the number of unread chat messages.
 * @param {UnreadMessagesBadgeProps} props - the props for the component
 *  @property {ReactElement} children - the ToolbarButton to be rendered
 * @returns {ReactElement} - The UnreadMessagesBadge component
 */
const UnreadMessagesBadge = ({ children }: UnreadMessagesBadgeProps): ReactElement => {
  const { unreadCount } = useSessionContext();

  return (
    <Badge
      badgeContent={unreadCount}
      data-testid="chat-button-unread-count"
      invisible={unreadCount === 0}
      sx={{
        '& .MuiBadge-badge': {
          color: 'white',
          backgroundColor: '#FA7B17',
        },
        marginRight: '12px',
      }}
      overlap="circular"
    >
      {children}
    </Badge>
  );
};

export default UnreadMessagesBadge;
