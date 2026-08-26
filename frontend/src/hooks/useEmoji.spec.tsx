import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Connection } from '@vonage/client-sdk-video';
import useEmoji from './useEmoji';
import type { SignalEvent } from '../types/session';

describe('useEmoji', () => {
  const from = { connectionId: 'other-connection' } as Connection;
  const props = { signal: vi.fn(), getConnectionId: () => 'my-connection' };

  it('ignores malformed (non-JSON) emoji signals without throwing or enqueuing', () => {
    const { result } = renderHook(() => useEmoji(props));

    act(() => {
      expect(() =>
        result.current.onEmoji({ data: 'not-json{', from } as unknown as SignalEvent, [])
      ).not.toThrow();
    });

    expect(result.current.emojiQueue).toEqual([]);
  });

  it('enqueues a well-formed emoji signal', () => {
    const { result } = renderHook(() => useEmoji(props));

    act(() => {
      result.current.onEmoji(
        {
          data: JSON.stringify({ emoji: '👍', time: 123 }),
          from,
        } as unknown as SignalEvent,
        []
      );
    });

    expect(result.current.emojiQueue).toHaveLength(1);
    expect(result.current.emojiQueue[0]).toMatchObject({ emoji: '👍', time: 123 });
  });
});
