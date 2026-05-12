import { describe, expect, it, vi, afterEach } from 'vitest';
import { render as renderBase, screen, fireEvent, cleanup } from '@testing-library/react';
import { ReactElement } from 'react';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import ChatInput from './ChatInput';
import { ChatMessageType } from '../../../types/chat';

const testMessages: ChatMessageType[] = [
  {
    participantName: 'User One',
    timestamp: 1726587657728,
    message: 'Hello all',
  },
];

const sendChatMessageMock = vi.fn();

describe('ChatInput', () => {
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
