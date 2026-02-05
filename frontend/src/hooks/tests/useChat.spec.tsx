import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useChat from '../useChat';
import { makeUserProviderWrapper } from '@test/providers';

const mockSignal = vi.fn();

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('onChatMessage should parse message and update messages state', () => {
    const { UserProviderWrapper } = makeUserProviderWrapper();
    const { result } = renderHook(() => useChat({ signal: mockSignal }), {
      wrapper: UserProviderWrapper,
    });

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
    const { UserProviderWrapper } = makeUserProviderWrapper({
      userOptions: {
        __interceptor: (context) => {
          context!.user.defaultSettings.name = 'Local User';
        },
      },
    });
    const { result } = renderHook(() => useChat({ signal: mockSignal }), {
      wrapper: UserProviderWrapper,
    });

    result.current.sendChatMessage('Hello there!');

    expect(mockSignal).toHaveBeenCalledWith({
      type: 'chat',
      data: '{"participantName":"Local User","text":"Hello there!"}',
    });
  });
});
