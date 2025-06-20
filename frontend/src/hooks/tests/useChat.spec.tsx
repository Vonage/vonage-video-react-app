import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import useChat from '../useChat';
import useUserContext from '../useUserContext';
import { UserContextType } from '../../Context/user';

vi.mock('../useUserContext.tsx');
const mockUseUserContext = useUserContext as Mock<[], UserContextType>;
const mockUserContext = {
  user: {
    defaultSettings: { name: 'Local User' },
  },
} as UserContextType;
const mockSignal = vi.fn();

describe('useChat', () => {
  beforeEach(() => {
    mockUseUserContext.mockImplementation(() => mockUserContext);
  });

  it('onChatMessage should parse message and update messages state', () => {
    const { result, rerender } = renderHook(() => useChat({ signal: mockSignal }));

    act(() => {
      result.current.onChatMessage('{"participantName":"Remote User","text":"Hello!"}');
    });
    rerender();

    expect(result.current.messages[0]).toMatchObject({
      participantName: 'Remote User',
      message: 'Hello!',
      timestamp: expect.any(Number),
    });
  });

  it('sendChatMessage should send message via signal', () => {
    const { result } = renderHook(() => useChat({ signal: mockSignal }));

    result.current.sendChatMessage('Hello there!');

    expect(mockSignal).toHaveBeenCalledWith({
      type: 'chat',
      data: '{"participantName":"Local User","text":"Hello there!"}',
    });
  });
});
