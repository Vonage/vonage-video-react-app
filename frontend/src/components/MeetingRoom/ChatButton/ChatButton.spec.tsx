import { render as renderBase, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReactElement } from 'react';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import ChatButton from './ChatButton';

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

  it('should have a white icon when the list is closed', () => {
    render(<ChatButton handleClick={() => {}} isOpen={false} />);
    expect(screen.getByTestId('ChatIcon')).toHaveStyle('color: rgb(255, 255, 255)');
  });

  it('should have a blue icon when the chat is open', () => {
    render(<ChatButton handleClick={() => {}} isOpen />);
    expect(screen.getByTestId('ChatIcon')).toHaveStyle('color: rgb(0, 0, 0)');
  });

  it('should invoke callback on click', () => {
    const handleClick = vi.fn();
    render(<ChatButton handleClick={handleClick} isOpen />);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });

  it('is not rendered when allowChat is false', () => {
    render(<ChatButton handleClick={() => {}} isOpen />, {
      appConfigContext: {
        value: {
          meetingRoomSettings: {
            allowChat: false,
          },
        },
      },
    });

    expect(screen.queryByTestId('ChatIcon')).not.toBeInTheDocument();
  });
});

type RenderOptions = {
  sessionContext?: ProviderOptions['SessionContext'];
  appConfigContext?: ProviderOptions['AppConfigContext'];
  userContext?: ProviderOptions['UserContext'];
};

function render(
  ui: ReactElement,
  { sessionContext, appConfigContext, userContext }: RenderOptions = {}
) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.appConfig, providers.user, providers.session],
    {
      sessionContext,
      appConfigContext,
      userContext,
    }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
