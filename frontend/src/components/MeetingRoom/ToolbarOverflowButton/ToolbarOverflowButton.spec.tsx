import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, render as renderBase, screen, cleanup } from '@testing-library/react';
import { ReactElement } from 'react';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import ToolbarOverflowButton from './ToolbarOverflowButton';
import {
  ToolbarOverflowMenuProps,
  CaptionsState,
} from '../ToolbarOverflowMenu/ToolbarOverflowMenu';

vi.mock('@hooks/useRoomName');
describe('ToolbarOverflowButton', () => {
  const mockSetLayoutMode = vi.fn();
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
  const defaultProps: ToolbarOverflowMenuProps = {
    toggleShareScreen: vi.fn(),
    isSharingScreen: false,
    toolbarButtonsCount: 0,
    isEmojiGridOpen: false,
    setIsEmojiGridOpen: vi.fn(),
    closeMenu: vi.fn(),
    isOpen: false,
    captionsState: {
      isUserCaptionsEnabled: false,
      setIsUserCaptionsEnabled: vi.fn(),
      setCaptionsErrorResponse: vi.fn(),
    } as CaptionsState,
  };
  it('renders', () => {
    render(<ToolbarOverflowButton {...defaultProps} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.subscriberWrappers = [];
            context.layoutMode = 'grid';
            context.setLayoutMode = mockSetLayoutMode;
            context.unreadCount = 0;
          }
        },
      },
    });
    expect(screen.queryByTestId('hidden-toolbar-items')).toBeInTheDocument();
  });
  it('toggling shows and hides the toolbar buttons', () => {
    render(<ToolbarOverflowButton {...defaultProps} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.subscriberWrappers = [];
            context.layoutMode = 'grid';
            context.setLayoutMode = mockSetLayoutMode;
            context.unreadCount = 0;
          }
        },
      },
    });
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
    render(<ToolbarOverflowButton {...defaultProps} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.subscriberWrappers = [];
            context.layoutMode = 'grid';
            context.setLayoutMode = mockSetLayoutMode;
            context.unreadCount = 0;
          }
        },
      },
    });
    // We expect the ChatButton in the ToolbarOverflowMenu and the ToolbarOverflowButton to have an unread messages badge present
    expect(screen.queryAllByTestId('chat-button-unread-count').length).toBe(2);
  });
});
type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function render(ui: ReactElement, { userContext, sessionContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.user, providers.session], {
    userContext,
    sessionContext,
  });

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
