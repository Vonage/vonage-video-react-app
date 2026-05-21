import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import useSelectDeviceHandler from './useSelectDeviceHandler';

describe('useSelectDeviceHandler', () => {
  it('returns handleDeviceChange function', () => {
    const { result } = renderHook(() => useSelectDeviceHandler());
    expect(typeof result.current.handleDeviceChange).toBe('function');
  });
});
