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

  it('shows badge with correct unread message count', () => {
    let sessionContextWithMessages: SessionContextType = {
      ...sessionContext,
      unreadCount: 8,
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContextWithMessages);

    const { rerender } = render(
      <UnreadMessagesBadge>
        <LittleButton />
      </UnreadMessagesBadge>
    );

    expect(screen.getByTestId('chat-button-unread-count')).toBeVisible();
    expect(screen.getByTestId('chat-button-unread-count').textContent).toBe('8');

    sessionContextWithMessages = {
      ...sessionContext,
      unreadCount: 9,
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContextWithMessages);
    rerender(
      <UnreadMessagesBadge>
        <LittleButton />
      </UnreadMessagesBadge>
    );
    expect(screen.getByTestId('chat-button-unread-count')).toBeVisible();
    expect(screen.getByTestId('chat-button-unread-count').textContent).toBe('9');
  });

  it('should not show unread message number when number is 0', () => {
    render(
      <UnreadMessagesBadge>
        <LittleButton />
      </UnreadMessagesBadge>
    );

    const badge = screen.getByTestId('chat-button-unread-count');
    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    expect(badge.offsetHeight).toBe(0);
    expect(badge.offsetWidth).toBe(0);
  });

  it('should not show unread message badge when message count is 0 and the toolbar is open', () => {
    render(
      <UnreadMessagesBadge isToolbarOverflowMenuOpen>
        <LittleButton />
      </UnreadMessagesBadge>
    );

    const badge = screen.getByTestId('chat-button-unread-count');
    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    expect(badge.offsetHeight).toBe(0);
    expect(badge.offsetWidth).toBe(0);
  });

  it('should not show unread message badge when message count is non zero and the toolbar is open', () => {
    const sessionContextWithMessages: SessionContextType = {
      ...sessionContext,
      unreadCount: 8,
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContextWithMessages);
    render(
      <UnreadMessagesBadge isToolbarOverflowMenuOpen>
        <LittleButton />
      </UnreadMessagesBadge>
    );

    const badge = screen.getByTestId('chat-button-unread-count');
    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    expect(badge.offsetHeight).toBe(0);
    expect(badge.offsetWidth).toBe(0);
  });

  it('should not show unread message badge when a new message comes in and the toolbar is open', () => {
    let sessionContextWithMessages: SessionContextType = {
      ...sessionContext,
      unreadCount: 0,
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContextWithMessages);
    const { rerender } = render(
      <UnreadMessagesBadge isToolbarOverflowMenuOpen>
        <LittleButton />
      </UnreadMessagesBadge>
    );

    const badge = screen.getByTestId('chat-button-unread-count');
    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    expect(badge.offsetHeight).toBe(0);
    expect(badge.offsetWidth).toBe(0);

    // a new message comes in
    sessionContextWithMessages = {
      ...sessionContext,
      unreadCount: 1,
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContextWithMessages);
    rerender(
      <UnreadMessagesBadge isToolbarOverflowMenuOpen>
        <LittleButton />
      </UnreadMessagesBadge>
    );

    // the badge remains hidden since the overflow toolbar is currently opened
    expect(badge.offsetHeight).toBe(0);
    expect(badge.offsetWidth).toBe(0);
  });
});
