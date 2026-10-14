import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, render as renderBase, screen, cleanup } from '@testing-library/react';
import { ReactElement } from 'react';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import ToolbarOverflowButton, {
  testIds as toolbarOverflowButtonTestIds,
} from './ToolbarOverflowButton';
import {
  ToolbarOverflowMenuProps,
  CaptionsState,
} from '../ToolbarOverflowMenu/ToolbarOverflowMenu';
import { testIds as archivingButtonTestIds } from '../ArchivingButton/ArchivingButton';
import { testIds as emojiGridButtonTestIds } from '../EmojiGridButton/EmojiGridButton';
import { testIds as layoutButtonTestIds } from '../LayoutButton/LayoutButton';
import { testIds as unreadMessagesBadgeTestIds } from '../UnreadMessagesBadge/UnreadMessagesBadge';

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
    expect(screen.queryByTestId(toolbarOverflowButtonTestIds.button)).toBeInTheDocument();
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
    expect(screen.queryByTestId(layoutButtonTestIds.button)).not.toBeVisible();
    expect(screen.queryByTestId(emojiGridButtonTestIds.button)).not.toBeVisible();
    expect(screen.queryByTestId(archivingButtonTestIds.button)).not.toBeVisible();
    act(() => {
      screen.getByTestId(toolbarOverflowButtonTestIds.button).click();
    });
    expect(screen.queryByTestId(layoutButtonTestIds.button)).toBeVisible();
    expect(screen.queryByTestId(emojiGridButtonTestIds.button)).toBeVisible();
    expect(screen.queryByTestId(archivingButtonTestIds.button)).toBeVisible();
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
    expect(screen.queryAllByTestId(unreadMessagesBadgeTestIds.unreadCount).length).toBe(2);
  });
});
type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function render(ui: ReactElement, { userContext, sessionContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.runtime],
    {
      userContext,
      sessionContext,
      runtimeContext: undefined,
    }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
