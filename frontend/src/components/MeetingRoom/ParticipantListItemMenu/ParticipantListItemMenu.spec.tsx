import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, cleanup, render as renderBase, screen } from '@testing-library/react';
import { Subscriber } from '@vonage/client-sdk-video';
import { SubscriberWrapper } from '../../../types/session';
import ParticipantListItemMenu from '.';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import { ReactElement } from 'react';

describe('ParticipantListItem', () => {
  const mockSubscriberWrapper: SubscriberWrapper = {
    id: 'subId',
    isPinned: false,
    isScreenshare: false,
    subscriber: {} as Subscriber,
    element: {} as HTMLVideoElement,
  };
  const defaultProps = {
    participantName: 'John Doe',
    subscriberWrapper: mockSubscriberWrapper,
  };

  const mockPinSubscriber = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('closes menu after clicking menu item', () => {
    render(<ParticipantListItemMenu {...defaultProps} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.isMaxPinned = false;
            context.pinSubscriber = mockPinSubscriber;
          }
        },
      },
    });
    const menuButton = screen.getByRole('button');
    act(() => menuButton.click());
    expect(screen.getByTestId('pin-menu-item')).toBeVisible();
    const pinButton = screen.getByText('Pin John Doe');
    act(() => pinButton.click());
    expect(screen.queryByTestId('pin-menu-item')).not.toBeInTheDocument();
  });

  it('can pin participant', () => {
    render(<ParticipantListItemMenu {...defaultProps} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.isMaxPinned = false;
            context.pinSubscriber = mockPinSubscriber;
          }
        },
      },
    });
    const menuButton = screen.getByRole('button');
    act(() => menuButton.click());
    const pinButton = screen.getByText('Pin John Doe');
    act(() => pinButton.click());
    expect(mockPinSubscriber).toHaveBeenCalledWith('subId');
  });

  it('can unpin participant', () => {
    render(
      <ParticipantListItemMenu
        {...{ ...defaultProps, subscriberWrapper: { ...mockSubscriberWrapper, isPinned: true } }}
      />,
      {
        sessionContext: {
          __interceptor: (context) => {
            if (context) {
              context.isMaxPinned = false;
              context.pinSubscriber = mockPinSubscriber;
            }
          },
        },
      }
    );
    const menuButton = screen.getByRole('button');
    act(() => menuButton.click());
    const pinButton = screen.getByText('Unpin John Doe');
    act(() => pinButton.click());
    expect(mockPinSubscriber).toHaveBeenCalledWith('subId');
  });

  it('cannot pin participant if maximum number of tiles are pinned', () => {
    render(<ParticipantListItemMenu {...defaultProps} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.isMaxPinned = true;
            context.pinSubscriber = mockPinSubscriber;
          }
        },
      },
    });
    const menuButton = screen.getByRole('button');
    act(() => menuButton.click());
    const pinButton = screen.getByText(/You can't pin any more tiles/);
    act(() => pinButton.click());
    expect(mockPinSubscriber).not.toHaveBeenCalled();
  });

  it('can still unpin participant if maximum number of tiles are pinned', () => {
    render(
      <ParticipantListItemMenu
        {...{ ...defaultProps, subscriberWrapper: { ...mockSubscriberWrapper, isPinned: true } }}
      />,
      {
        sessionContext: {
          __interceptor: (context) => {
            if (context) {
              context.isMaxPinned = true;
              context.pinSubscriber = mockPinSubscriber;
            }
          },
        },
      }
    );
    const menuButton = screen.getByRole('button');
    act(() => menuButton.click());
    const pinButton = screen.getByText('Unpin John Doe');
    act(() => pinButton.click());
    expect(mockPinSubscriber).toHaveBeenCalledWith('subId');
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
