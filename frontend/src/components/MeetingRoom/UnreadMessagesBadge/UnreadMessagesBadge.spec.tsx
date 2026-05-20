import { describe, it, expect, afterEach } from 'vitest';
import { render as renderBase, screen, cleanup } from '@testing-library/react';
import VividIcon from '@ui/VividIcon';
import { ReactElement } from 'react';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import UnreadMessagesBadge from './UnreadMessagesBadge';
import { env } from '../../../env';
import ToolbarButton from '../ToolbarButton';
const LittleButton = () => (
  <ToolbarButton onClick={() => {}} icon={<VividIcon name="chat-solid" customSize={-6} />} />
);

describe('UnreadMessagesBadge', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows badge with correct unread message count', () => {
    render(
      <UnreadMessagesBadge>
        <LittleButton />
      </UnreadMessagesBadge>,
      {
        sessionContext: {
          __interceptor: (context) => {
            if (context) {
              context.unreadCount = 8;
            }
          },
        },
      }
    );

    expect(screen.getByTestId('chat-button-unread-count')).toBeVisible();
    expect(screen.getByTestId('chat-button-unread-count').textContent).toBe('8');

    cleanup();

    render(
      <UnreadMessagesBadge>
        <LittleButton />
      </UnreadMessagesBadge>,
      {
        sessionContext: {
          __interceptor: (context) => {
            if (context) {
              context.unreadCount = 9;
            }
          },
        },
      }
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
    render(
      <UnreadMessagesBadge isToolbarOverflowMenuOpen>
        <LittleButton />
      </UnreadMessagesBadge>,
      {
        sessionContext: {
          __interceptor: (context) => {
            if (context) {
              context.unreadCount = 8;
            }
          },
        },
      }
    );

    const badge = screen.getByTestId('chat-button-unread-count');
    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    expect(badge.offsetHeight).toBe(0);
    expect(badge.offsetWidth).toBe(0);
  });

  it('should not show unread message badge when a new message comes in and the toolbar is open', () => {
    const { rerender } = render(
      <UnreadMessagesBadge isToolbarOverflowMenuOpen>
        <LittleButton />
      </UnreadMessagesBadge>,
      {
        sessionContext: {
          __interceptor: (context) => {
            if (context) {
              context.unreadCount = 0;
            }
          },
        },
      }
    );

    const badge = screen.getByTestId('chat-button-unread-count');
    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    expect(badge.offsetHeight).toBe(0);
    expect(badge.offsetWidth).toBe(0);

    // a new message comes in
    rerender(
      <UnreadMessagesBadge isToolbarOverflowMenuOpen>
        <LittleButton />
      </UnreadMessagesBadge>
    );

    // the badge remains hidden since the overflow toolbar is currently opened
    const updatedBadge = screen.getByTestId('chat-button-unread-count');
    expect(updatedBadge.offsetHeight).toBe(0);
    expect(updatedBadge.offsetWidth).toBe(0);
  });

  it('should show the unread message badge when a new message comes in and the toolbar was opened at first but is now closed', () => {
    render(
      <UnreadMessagesBadge isToolbarOverflowMenuOpen>
        <LittleButton />
      </UnreadMessagesBadge>,
      {
        sessionContext: {
          __interceptor: (context) => {
            if (context) {
              context.unreadCount = 0;
            }
          },
        },
      }
    );

    const badge = screen.getByTestId('chat-button-unread-count');
    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    expect(badge.offsetHeight).toBe(0);
    expect(badge.offsetWidth).toBe(0);

    cleanup();

    // a new message comes in and toolbar has been closed
    render(
      <UnreadMessagesBadge isToolbarOverflowMenuOpen={false}>
        <LittleButton />
      </UnreadMessagesBadge>,
      {
        sessionContext: {
          __interceptor: (context) => {
            if (context) {
              context.unreadCount = 1;
            }
          },
        },
      }
    );

    const updatedBadge = screen.getByTestId('chat-button-unread-count');
    expect(updatedBadge).toBeVisible();
    expect(updatedBadge.textContent).toBe('1');
  });

  it('should not show the message badge when allowChat is false', () => {
    env.partialUpdate({
      ALLOW_CHAT: false,
    });

    render(
      <UnreadMessagesBadge>
        <LittleButton />
      </UnreadMessagesBadge>,
      {
        sessionContext: {
          __interceptor: (context) => {
            if (context) {
              context.unreadCount = 8;
            }
          },
        },
      }
    );

    const badge = screen.getByTestId('chat-button-unread-count');
    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    expect(badge.offsetHeight).toBe(0);
    expect(badge.offsetWidth).toBe(0);
  });
});

type RenderOptions = {
  sessionContext?: ProviderOptions['SessionContext'];
  userContext?: ProviderOptions['UserContext'];
};

function render(ui: ReactElement, { sessionContext, userContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.runtime],
    {
      sessionContext,
      userContext,
      runtimeContext: undefined,
    }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
