import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import useSuspenseMemo from './';
import SuspenseBoundary from '../../components/SuspenseBoundary';

describe('useSuspenseMemo', () => {
  it('should return synchronous value immediately', () => {
    const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <SuspenseBoundary fallback={<div>Loading...</div>}>{children}</SuspenseBoundary>
    );

    const { result } = renderHook(() => useSuspenseMemo(() => 'test value', []), {
      wrapper: TestWrapper,
    });

    expect(result.current).toBe('test value');
  });

  it('should memoize value based on dependencies', () => {
    const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <SuspenseBoundary fallback={<div>Loading...</div>}>{children}</SuspenseBoundary>
    );

    const callback = () => ({ value: 'test' });

    const { result, rerender } = renderHook(({ deps }) => useSuspenseMemo(callback, deps), {
      wrapper: TestWrapper,
      initialProps: { deps: [1] },
    });

    const firstResult = result.current;

    // Rerender with same dependencies
    rerender({ deps: [1] });
    expect(result.current).toBe(firstResult);

    // Rerender with different dependencies
    rerender({ deps: [2] });
    expect(result.current).not.toBe(firstResult);
  });

  it('should throw error when used outside SuspenseBoundary Provider', () => {
    expect(() => {
      renderHook(() => useSuspenseMemo(() => 'test', []));
    }).toThrow('useSuspenseMemo must be used within a SuspenseBoundary Provider');
  });
});
