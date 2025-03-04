import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import useSessionContext from '../../../hooks/useSessionContext';
import { SessionContextType } from '../../../Context/SessionProvider/session';
import ToolbarOverflowButton from './ToolbarOverflowButton';
import useUserContext from '../../../hooks/useUserContext';
import { UserContextType } from '../../../Context/user';
import useShownButtons from '../../../hooks/useShownButtons';

vi.mock('../../../hooks/useSessionContext');
vi.mock('../../../hooks/useUserContext');
vi.mock('../../../hooks/useRoomName');
vi.mock('../../../hooks/useShownButtons');
const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const mockUseUserContext = useUserContext as Mock<[], UserContextType>;
const mockSetUser = vi.fn();
const mockUseShownButtons = useShownButtons as Mock<[], number>;

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
    mockUseShownButtons.mockReturnValue(0);
  });

  it('renders', () => {
    render(<ToolbarOverflowButton toggleShareScreen={vi.fn()} isSharingScreen={false} />);
    expect(screen.queryByTestId('hidden-toolbar-items')).toBeInTheDocument();
  });

  it('toggling shows and hides the toolbar buttons', () => {
    render(<ToolbarOverflowButton toggleShareScreen={vi.fn()} isSharingScreen={false} />);

    expect(screen.queryByTestId('layout-button')).not.toBeVisible();
    expect(screen.queryByTestId('emoji-grid-button')).not.toBeVisible();
    expect(screen.queryByTestId('archiving-button')).not.toBeVisible();

    act(() => {
      screen.getByTestId('hidden-toolbar-items').click();
    });

    expect(screen.queryByTestId('layout-button')).toBeVisible();
    expect(screen.queryByTestId('emoji-grid-button')).toBeVisible();
    expect(screen.queryByTestId('archiving-button')).toBeVisible();
  });

  it('should have the unread messages badge present', () => {
    render(<ToolbarOverflowButton toggleShareScreen={vi.fn()} isSharingScreen={false} />);

    // We expect the ChatButton in the ToolbarOverflowMenu and the ToolbarOverflowButton to have an unread messages badge present
    expect(screen.queryAllByTestId('chat-button-unread-count').length).toBe(2);
  });
});
