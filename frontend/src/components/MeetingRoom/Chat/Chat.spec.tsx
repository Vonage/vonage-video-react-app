import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render as renderBase, screen, within } from '@testing-library/react';
import { ReactElement } from 'react';
import Chat from './Chat';
import { ChatMessageType } from '../../../types/chat';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import { SessionContextType } from '../../../Context/SessionProvider/session';

const testMessages: ChatMessageType[] = [
  {
    participantName: 'User One',
    timestamp: 1726587657728,
    message: 'Hello all',
  },
  {
    participantName: 'User Two',
    timestamp: 1726587657729,
    message: 'Good morning',
  },
  {
    participantName: 'User Three',
    timestamp: 1726587657730,
    message: 'Hi',
  },
  {
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
});

type RenderOptions = {
  sessionContext?: ProviderOptions['SessionContext'];
  userContext?: ProviderOptions['UserContext'];
};

function render(ui: ReactElement, { sessionContext, userContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.user, providers.session], {
    sessionContext,
    userContext,
  });

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
