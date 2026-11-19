import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import useRenderCount from './';

describe('useRenderCount', () => {
  it('should increment on each re-render', () => {
    const { result, rerender } = renderHook(() => useRenderCount());

    rerender();
    expect(result.current).toBe(2);

    rerender();
    expect(result.current).toBe(3);
  });
});
