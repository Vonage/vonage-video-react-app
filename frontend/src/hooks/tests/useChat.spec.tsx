import { act, renderHook as renderHookBase } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useChat from '../useChat';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';

const mockSignal = vi.fn();

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('sendChatMessage should send message via signal', () => {
    const { result } = renderHook(() => useChat({ signal: mockSignal }), {
      userContext: {
        value: {
          defaultSettings: {
            name: 'Local User',
          },
        },
      },
    });

    result.current.sendChatMessage('Hello there!');

    expect(mockSignal).toHaveBeenCalledWith({
      type: 'chat',
      data: '{"participantName":"Local User","text":"Hello there!"}',
    });
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
