import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import notifications$ from './notifications$';

describe('notifications$', () => {
  it('push, dismiss, and clearAll manage the notifications map correctly', () => {
    const { result } = renderHook(() => notifications$.use());

    act(() => {
      notifications$.actions.push({ type: 'info', message: 'A', expirationMs: null });
      notifications$.actions.push({ type: 'warning', message: 'B', expirationMs: null });
    });

    expect(result.current[0].notifications.size).toBe(2);

    const [first] = result.current[0].notifications.values();
    act(() => notifications$.actions.dismiss(first.id));
    expect(result.current[0].notifications.size).toBe(1);

    act(() => notifications$.actions.clearAll());
    expect(result.current[0].notifications.size).toBe(0);
  });
});
