import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import useSessionContext from '../../../hooks/useSessionContext';
import { SessionContextType } from '../../../Context/SessionProvider/session';
import ToolbarOverflowButton from './ToolbarOverflowButton';
import useUserContext from '../../../hooks/useUserContext';
import { UserContextType } from '../../../Context/user';

vi.mock('../../../hooks/useSessionContext');
vi.mock('../../../hooks/useUserContext');
vi.mock('../../../hooks/useRoomName');
const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const mockUseUserContext = useUserContext as Mock<[], UserContextType>;
const mockSetUser = vi.fn();
const defaultUserContext = {
  user: {
    defaultSettings: {
      openEmojisGrid: false,
    },
  },
  setUser: mockSetUser,
} as unknown as UserContextType;
const sessionContext = {
  subscriberWrappers: [],
  layoutMode: 'grid',
  setLayoutMode: vi.fn(),
  unreadCount: 0,
} as unknown as SessionContextType;

describe('ToolbarOverflowButton', () => {
  beforeEach(() => {
    mockUseSessionContext.mockReturnValue(sessionContext);
    mockUseUserContext.mockReturnValue(defaultUserContext);
  });

  it('renders', () => {
    render(<ToolbarOverflowButton />);
    expect(screen.queryByTestId('hidden-toolbar-items')).toBeInTheDocument();
  });

  it('toggling shows and hides the toolbar buttons', () => {
    render(<ToolbarOverflowButton />);

    expect(screen.queryByTestId('layout-toggle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('emoji-grid-toggle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('archiving-toggle')).not.toBeInTheDocument();

    act(() => {
      screen.getByTestId('hidden-toolbar-items').click();
    });

    expect(screen.queryByTestId('layout-toggle')).toBeVisible();
    expect(screen.queryByTestId('emoji-grid-toggle')).toBeVisible();
    expect(screen.queryByTestId('archiving-toggle')).toBeVisible();
  });

  it('should have the unread messages badge present', () => {
    const sessionContextWithMessages: SessionContextType = {
      ...sessionContext,
      unreadCount: 8,
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContextWithMessages);

    render(<ToolbarOverflowButton />);

    expect(screen.getByTestId('chat-toggle-unread-count')).toBeVisible();
    expect(screen.getByTestId('chat-toggle-unread-count').textContent).toBe('8');
  });
});
