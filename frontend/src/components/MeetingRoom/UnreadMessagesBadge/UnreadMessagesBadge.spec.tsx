import { describe, it, vi, expect, Mock, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BiotechIcon from '@mui/icons-material/Biotech';
import useSessionContext from '../../../hooks/useSessionContext';
import { SessionContextType } from '../../../Context/SessionProvider/session';
import UnreadMessagesBadge from './UnreadMessagesBadge';
import ToolbarButton from '../ToolbarButton';

vi.mock('../../../hooks/useSessionContext');
const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const sessionContext = {
  unreadCount: 0,
} as unknown as SessionContextType;
const LittleButton = () => <ToolbarButton onClick={() => {}} icon={<BiotechIcon />} />;

describe('UnreadMessagesBadge', () => {
  beforeEach(() => {
    mockUseSessionContext.mockReturnValue(sessionContext);
  });

  it('should show unread message number when number is 8', () => {
    const sessionContextWithMessages: SessionContextType = {
      ...sessionContext,
      unreadCount: 8,
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContextWithMessages);

    render(
      <UnreadMessagesBadge>
        <LittleButton />
      </UnreadMessagesBadge>
    );

    expect(screen.getByTestId('chat-toggle-unread-count')).toBeVisible();
    expect(screen.getByTestId('chat-toggle-unread-count').textContent).toBe('8');
  });

  it('should not show unread message number when number is 0', () => {
    render(
      <UnreadMessagesBadge>
        <LittleButton />
      </UnreadMessagesBadge>
    );

    const badge = screen.getByTestId('chat-toggle-unread-count');
    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    expect(badge.offsetHeight).toBe(0);
    expect(badge.offsetWidth).toBe(0);
  });
});
