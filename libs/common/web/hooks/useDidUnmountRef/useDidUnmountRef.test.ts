import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import useDidUnmountRef from './useDidUnmountRef';

describe('useDidUnmountRef', () => {
  it('should return false initially', () => {
    const { result } = renderHook(() => useDidUnmountRef());

    expect(result.current.current).toBe(false);
  });

  it('should set ref to true after unmount', () => {
    const { result, unmount } = renderHook(() => useDidUnmountRef());

    expect(result.current.current).toBe(false);

    unmount();

    expect(result.current.current).toBe(true);
  });
});
