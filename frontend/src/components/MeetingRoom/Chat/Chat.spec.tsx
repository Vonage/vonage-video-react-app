import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render as renderBase, screen, within } from '@testing-library/react';
import { ReactElement } from 'react';
import Chat from './Chat';
import { ChatMessageType } from '../../../types/chat';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import { SessionContextType } from '../../../Context/SessionProvider/session';

const testMessages: ChatMessageType[] = [
  {
    id: 'message-1',
    participantName: 'User One',
    timestamp: 1726587657728,
    message: 'Hello all',
  },
  {
    id: 'message-2',
    participantName: 'User Two',
    timestamp: 1726587657729,
    message: 'Good morning',
  },
  {
    id: 'message-3',
    participantName: 'User Three',
    timestamp: 1726587657730,
    message: 'Hi',
  },
  {
    id: 'message-4',
    participantName: 'User Four',
    timestamp: 1726587657731,
    message: 'Sup',
  },
];

describe('Chat', () => {
  afterEach(() => {
    cleanup();
  });

  it('should display messages', () => {
    render(<Chat handleClose={() => {}} isOpen />, {
      sessionContext: {
        __interceptor: (context: SessionContextType) => {
          if (context) {
            context.messages = testMessages;
          }
        },
      },
    });

    const chatMessages = screen.getAllByTestId('chat-message');
    expect(chatMessages.length).toBe(4);

    expect(within(chatMessages[0]).getByTestId('chat-msg-participant-name').textContent).toEqual(
      'User One'
    );
    expect(within(chatMessages[0]).getByTestId('chat-msg-timestamp').textContent).toEqual(
      '11:40 AM'
    );
    expect(chatMessages[0].textContent).toMatch('Hello all');
  });

  it('renders messages that share a timestamp without duplicate React keys', () => {
    const sameTimestampMessages: ChatMessageType[] = [
      { id: 'message-a', participantName: 'User One', timestamp: 1726587657728, message: 'first' },
      { id: 'message-b', participantName: 'User Two', timestamp: 1726587657728, message: 'second' },
    ];

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Chat handleClose={() => {}} isOpen />, {
      sessionContext: {
        __interceptor: (context: SessionContextType) => {
          if (context) {
            context.messages = sameTimestampMessages;
          }
        },
      },
    });

    expect(screen.getAllByTestId('chat-message')).toHaveLength(2);

    // Keying by the non-unique timestamp made React warn (and risk reconciliation bugs) when two
    // messages arrived in the same millisecond; keying by the unique id avoids it.
    const hasDuplicateKeyWarning = errorSpy.mock.calls.some((args) =>
      args.some((arg) => typeof arg === 'string' && arg.includes('same key'))
    );
    expect(hasDuplicateKeyWarning).toBe(false);

    errorSpy.mockRestore();
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
