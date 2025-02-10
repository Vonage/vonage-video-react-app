import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useEmojiGrid from '../useEmojiGrid';

describe('useEmojiGrid hook', () => {
  it('should initialize with value "true"', () => {
    const { result } = renderHook(() => useEmojiGrid());

    expect(result.current.openEmojiGrid).toBe(true);
  });

  it('should update value of whether the emoji grid should be open or closed', () => {
    const { result } = renderHook(() => useEmojiGrid());

    expect(result.current.openEmojiGrid).toBe(true);

    act(() => {
      result.current.setOpenEmojiGrid(false);
    });

    expect(result.current.openEmojiGrid).toBe(false);
  });
});
