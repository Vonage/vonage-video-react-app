import { render as renderBase, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReactElement } from 'react';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import ChatButton from './ChatButton';
import { env } from './../../../env';

describe('ChatButton', () => {
  it('should show unread message number', () => {
    render(<ChatButton handleClick={() => {}} isOpen={false} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.unreadCount = 10;
          }
        },
      },
    });
    expect(screen.getByTestId('chat-button-unread-count')).toBeVisible();
    expect(screen.getByTestId('chat-button-unread-count').textContent).toBe('10');
  });

  it('should not show unread message number when number is 0', () => {
    render(<ChatButton handleClick={() => {}} isOpen={false} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.unreadCount = 0;
          }
        },
      },
    });

    const badge = screen.getByTestId('chat-button-unread-count');
    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    expect(badge.offsetHeight).toBe(0);
    expect(badge.offsetWidth).toBe(0);
  });

  it('should invoke callback on click', () => {
    const handleClick = vi.fn();
    render(<ChatButton handleClick={handleClick} isOpen />);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });

  it('is not rendered when allowChat is false', () => {
    env.partialUpdate({
      ALLOW_CHAT: false,
    });
    render(<ChatButton handleClick={() => {}} isOpen />);

    expect(screen.queryByTestId('ChatIcon')).not.toBeInTheDocument();
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
