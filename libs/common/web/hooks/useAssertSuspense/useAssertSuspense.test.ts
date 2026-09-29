import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import useAssertSuspense from './';
import SuspenseBoundary from '@web/components/SuspenseBoundary';

describe('useAssertSuspense', () => {
  it('should throw error when not wrapped in SuspenseBoundary', () => {
    const errorMessage = 'This hook must be used within a SuspenseBoundary';

    expect(() => {
      renderHook(() => useAssertSuspense(errorMessage));
    }).toThrow(errorMessage);
  });

  it('should not throw error when wrapped in SuspenseBoundary', () => {
    const errorMessage = 'This hook must be used within a SuspenseBoundary';

    expect(() => {
      renderHook(() => useAssertSuspense(errorMessage), {
        wrapper: SuspenseBoundary,
      });
    }).not.toThrow();
  });
});
