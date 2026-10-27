import { act, renderHook as renderHookBase } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useChat from '../useChat';
import { notifications$ } from '@core/stores';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';

const mockSignal = vi.fn();

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignal.mockResolvedValue(undefined);
  });

  it('onChatMessage should parse message and update messages state', () => {
    const { result } = renderHook(() => useChat({ signal: mockSignal }));

    act(() => {
      result.current.onChatMessage('{"participantName":"Remote User","text":"Hello!"}');
    });

    expect(result.current.messages[0]).toMatchObject({
      participantName: 'Remote User',
      message: 'Hello!',
      timestamp: expect.any(Number),
    });
  });

  it('onChatMessage should assign a unique id to each message', () => {
    const { result } = renderHook(() => useChat({ signal: mockSignal }));

    act(() => {
      result.current.onChatMessage('{"participantName":"Remote User","text":"Hello!"}');
      result.current.onChatMessage('{"participantName":"Remote User","text":"Hello again!"}');
    });

    expect(result.current.messages[0].id).toBeTruthy();
    expect(result.current.messages[0].id).not.toBe(result.current.messages[1].id);
  });

  it('onChatMessage should fall back to getRandomValues when randomUUID is unavailable', () => {
    const originalRandomUUID = crypto.randomUUID;
    // @ts-expect-error simulating a runtime without crypto.randomUUID
    crypto.randomUUID = undefined;

    try {
      const { result } = renderHook(() => useChat({ signal: mockSignal }));

      act(() => {
        result.current.onChatMessage('{"participantName":"Remote User","text":"Hello!"}');
      });

      expect(result.current.messages[0].id).toBeTruthy();
    } finally {
      crypto.randomUUID = originalRandomUUID;
    }
  });

  it('onChatMessage should use the unknown user label when the participant name is missing', () => {
    const { result } = renderHook(() => useChat({ signal: mockSignal }));

    act(() => {
      result.current.onChatMessage('{"text":"Hello!"}');
    });

    expect(result.current.messages[0]).toMatchObject({
      participantName: 'unknown user',
      message: 'Hello!',
    });
  });

  it('onChatMessage should ignore empty or invalid data', () => {
    const { result } = renderHook(() => useChat({ signal: mockSignal }));

    act(() => {
      result.current.onChatMessage('');
      result.current.onChatMessage('invalid JSON');
    });

    expect(result.current.messages).toHaveLength(0);
  });

  it('sendChatMessage should send message via signal with retryAfterReconnect enabled', async () => {
    expect.assertions(1);
    const { result } = renderHook(() => useChat({ signal: mockSignal }), {
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

  it('sendChatMessage should do nothing when signal is unavailable', () => {
    const { result } = renderHook(() => useChat({ signal: undefined }));

    expect(() => result.current.sendChatMessage('Hello there!')).not.toThrow();
  });

  it('pushes a visible error notification when the signal rejects', async () => {
    expect.assertions(1);
    mockSignal.mockRejectedValueOnce(new Error('signal failed'));
    const pushSpy = vi.spyOn(notifications$.actions, 'push');

    const { result } = renderHook(() => useChat({ signal: mockSignal }));

    await act(async () => {
      await result.current.sendChatMessage('Hello there!');
    });

    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        message: "Your message couldn't be sent. Please check your network and try again.",
      })
    );
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
