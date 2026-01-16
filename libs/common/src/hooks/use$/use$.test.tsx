import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import use$ from './';
import SuspenseBoundary from '../../components/SuspenseBoundary';

describe('use$', () => {
  it('should throw error when used outside SuspenseBoundary Provider', () => {
    expect(() => {
      renderHook(() => use$(Promise.resolve('test')));
    }).toThrow('use$ must be used within a SuspenseBoundary Provider');
  });

  it('should not throw when used within SuspenseBoundary Provider', () => {
    const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <SuspenseBoundary fallback={<div>Loading...</div>}>{children}</SuspenseBoundary>
    );

    expect(() => {
      renderHook(() => use$('test' as unknown as Promise<string>), {
        wrapper: TestWrapper,
      });
    }).not.toThrow();
  });

  it('should return non-promise values directly', () => {
    const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <SuspenseBoundary fallback={<div>Loading...</div>}>{children}</SuspenseBoundary>
    );

    const { result } = renderHook(() => use$('test' as unknown as Promise<string>), {
      wrapper: TestWrapper,
    });

    expect(result.current).toBe('test');
  });
});
