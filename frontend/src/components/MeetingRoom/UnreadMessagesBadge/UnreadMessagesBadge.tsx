import { Badge } from '@mui/material';
import { ForwardedRef, forwardRef, ReactElement } from 'react';
import useSessionContext from '../../../hooks/useSessionContext';

export type UnreadMessagesBadgeProps = {
  children: ReactElement;
  isToolbarOverflowMenuOpen?: boolean;
};

/**
 * UnreadMessagesBadge Component
 *
 * Displays a badge indicating the number of unread chat messages.
 * @param {UnreadMessagesBadgeProps} props - the props for the component
 *  @property {ReactElement} children - the ToolbarButton to be rendered
 *  @property {boolean} isToolbarOverflowMenuOpen - (optional) indicates whether the overflow menu was opened
 * @returns {ReactElement} - The UnreadMessagesBadge component
 */
const UnreadMessagesBadge = forwardRef(function UnreadMessagesBadge(
  props: UnreadMessagesBadgeProps,
  ref: ForwardedRef<HTMLSpanElement>
) {
  const { children, isToolbarOverflowMenuOpen, ...rest } = props;
  const { unreadCount } = useSessionContext();
  const isInvisible = unreadCount === 0 || isToolbarOverflowMenuOpen;
  return (
    <Badge
      {...rest}
      badgeContent={unreadCount}
      data-testid="chat-button-unread-count"
      invisible={isInvisible}
      sx={{
        '& .MuiBadge-badge': {
          color: 'white',
          backgroundColor: '#FA7B17',
        },
        marginRight: '12px',
      }}
      overlap="circular"
      ref={ref}
    >
      {children}
    </Badge>
  );
});

export default UnreadMessagesBadge;
