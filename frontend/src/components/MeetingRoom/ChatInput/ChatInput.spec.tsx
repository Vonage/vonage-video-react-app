import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render as renderBase, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ReactElement } from 'react';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import ChatInput from './ChatInput';
import type { ChatMessageType, ChatMessageId } from '@app-types/chat';

const testMessages: ChatMessageType[] = [
  {
    id: 'message-1' as ChatMessageId,
    participantName: 'User One',
    timestamp: 1726587657728,
    message: 'Hello all',
  },
];

const sendChatMessageMock = vi.fn();

describe('ChatInput', () => {
  beforeEach(() => {
    sendChatMessageMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the chat input field', () => {
    render(<ChatInput />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.sendChatMessage = sendChatMessageMock;
          }
        },
      },
    });
    const input = screen.getByPlaceholderText('Send a message');
    expect(input).toBeInTheDocument();
  });

  it('does not send a message when composing', () => {
    render(<ChatInput />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.sendChatMessage = sendChatMessageMock;
          }
        },
      },
    });
    const input = screen.getByPlaceholderText('Send a message');

    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    expect(sendChatMessageMock).not.toHaveBeenCalled();

    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    expect(sendChatMessageMock).not.toHaveBeenCalled();
  });

  it('sends a message on Enter when not composing', () => {
    render(<ChatInput />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.sendChatMessage = sendChatMessageMock;
          }
        },
      },
    });
    const input = screen.getByPlaceholderText('Send a message');

    fireEvent.change(input, { target: { value: testMessages[0].message } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    expect(sendChatMessageMock).toHaveBeenCalledWith(testMessages[0].message);
  });

  it('does not send a message on Enter if Shift is pressed', () => {
    render(<ChatInput />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.sendChatMessage = sendChatMessageMock;
          }
        },
      },
    });
    const input = screen.getByPlaceholderText('Send a message');

    fireEvent.change(input, { target: { value: testMessages[0].message } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(sendChatMessageMock).not.toHaveBeenCalled();
  });

  it('trims whitespace before sending a message', () => {
    render(<ChatInput />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.sendChatMessage = sendChatMessageMock;
          }
        },
      },
    });
    const input = screen.getByPlaceholderText('Send a message');

    fireEvent.change(input, { target: { value: `   ${testMessages[0].message}   ` } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    expect(sendChatMessageMock).toHaveBeenCalledWith(`${testMessages[0].message}`);
  });

  it('does not send an empty message', () => {
    render(<ChatInput />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.sendChatMessage = sendChatMessageMock;
          }
        },
      },
    });
    const input = screen.getByPlaceholderText('Send a message');
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(sendButton);
    expect(sendChatMessageMock).not.toHaveBeenCalled();
  });

  it('clears the input once the message is sent successfully', async () => {
    render(<ChatInput />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.sendChatMessage = sendChatMessageMock;
          }
        },
      },
    });
    const input = screen.getByPlaceholderText<HTMLInputElement>('Send a message');

    fireEvent.change(input, { target: { value: testMessages[0].message } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    await waitFor(() => expect(input.value).toBe(''));
  });

  it('keeps the typed text when the message fails to send', async () => {
    expect.assertions(1);
    sendChatMessageMock.mockRejectedValueOnce(new Error('signal failed'));
    render(<ChatInput />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.sendChatMessage = sendChatMessageMock;
          }
        },
      },
    });
    const input = screen.getByPlaceholderText<HTMLInputElement>('Send a message');

    fireEvent.change(input, { target: { value: testMessages[0].message } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      if (sendChatMessageMock.mock.calls.length === 0) {
        throw new Error('Expected sendChatMessage to have been called');
      }
    });
    expect(input.value).toBe(testMessages[0].message);
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
