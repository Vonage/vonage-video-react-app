import { act, renderHook as renderHookBase, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useChat from '../useChat';
import frontendLogger from '../../logger';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';

const mockSignal = vi.fn();
const mockProvider = { log: vi.fn(), reportError: vi.fn() };

frontendLogger.setup(() => mockProvider);

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignal.mockResolvedValue(undefined);
  });

  it('onChatMessage should parse message and update messages state', () => {
    const { result } = renderHook(() => useChat({ signal: mockSignal, reconnecting: false }));

    act(() => {
      result.current.onChatMessage('{"participantName":"Remote User","text":"Hello!"}');
    });

    expect(result.current.messages[0]).toMatchObject({
      participantName: 'Remote User',
      message: 'Hello!',
      timestamp: expect.any(Number),
    });
  });

  it('sendChatMessage should send message via signal with retryAfterReconnect enabled', async () => {
    const { result } = renderHook(() => useChat({ signal: mockSignal, reconnecting: false }), {
      userContext: {
        value: {
          defaultSettings: {
            name: 'Local User',
          },
        },
      },
    });

    await act(async () => {
      await result.current.sendChatMessage('Hello there!');
    });

    expect(mockSignal).toHaveBeenCalledWith({
      type: 'chat',
      data: '{"participantName":"Local User","text":"Hello there!"}',
      retryAfterReconnect: true,
    });
  });

  it('surfaces a visible chatSendError when the signal rejects outside of reconnection', async () => {
    const fakeError = new Error('signal failed');
    mockSignal.mockRejectedValueOnce(fakeError);

    const { result } = renderHook(() => useChat({ signal: mockSignal, reconnecting: false }));

    await act(async () => {
      await result.current.sendChatMessage('Hello there!');
    });

    await waitFor(() =>
      expect(result.current.chatSendError).toEqual({
        header: 'Message not sent',
        caption: "Your message couldn't be sent. Please check your network and try again.",
      })
    );
    expect(mockProvider.reportError).toHaveBeenCalledTimes(1);
    const [reportedError, context] = mockProvider.reportError.mock.calls[0];
    expect(reportedError).toMatchObject({ message: fakeError.message });
    expect(context).toEqual({ eventSource: 'useChat.sendChatMessage' });
  });

  it('does not surface an error when the signal fails during reconnection', async () => {
    expect.assertions(2);
    mockSignal.mockRejectedValueOnce(new Error('signal failed'));

    const { result } = renderHook(() => useChat({ signal: mockSignal, reconnecting: true }));

    await act(async () => {
      await result.current.sendChatMessage('Hello there!');
    });

    expect(result.current.chatSendError).toBeNull();
    expect(mockProvider.reportError).not.toHaveBeenCalled();
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
};

function renderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  { userContext }: RenderOptions = {}
) {
  const { wrapper, ...context } = makeTestProvider([providers.user], {
    userContext,
  });

  return {
    ...context,
    ...renderHookBase(render, { wrapper }),
  };
}
