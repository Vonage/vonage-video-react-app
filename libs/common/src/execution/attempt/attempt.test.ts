import { describe, it, expect, vi } from 'vitest';
import attempt from './attempt';

describe('attempt', () => {
  it('should handle synchronous function with error', () => {
    const error = new Error('sync error');

    const mockCallback = vi.fn((): void => {
      throw error;
    });

    const onError = vi.fn();

    attempt(mockCallback, onError);

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should handle asynchronous function with error', () => {
    const error = new Error('async error');

    const mockCallback = vi.fn((): Promise<void> => {
      throw error;
    });

    const onError = vi.fn();

    attempt(() => mockCallback(), onError);

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error);
  });
});
