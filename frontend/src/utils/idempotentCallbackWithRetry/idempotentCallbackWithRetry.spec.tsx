import { describe, it, expect, vi } from 'vitest';
import idempotentCallbackWithRetry from './idempotentCallbackWithRetry';

describe('idempotentCallbackWithRetry', () => {
  it('should return successful result on first attempt', async () => {
    const callback = vi.fn().mockResolvedValue('success');

    const result = await idempotentCallbackWithRetry(callback, { delayMs: 1 });

    expect(result).toBe('success');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should retry and succeed on second attempt', async () => {
    const callback = vi
      .fn()
      .mockRejectedValueOnce(new Error('first fail'))
      .mockResolvedValue('success');

    const result = await idempotentCallbackWithRetry(callback, { delayMs: 1 });

    expect(result).toBe('success');
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should throw error after max retries', async () => {
    const error = new Error('persistent error');
    const callback = vi.fn().mockRejectedValue(error);

    await expect(idempotentCallbackWithRetry(callback, { retries: 2, delayMs: 1 })).rejects.toThrow(
      'persistent error'
    );

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('should call onRetry callback on failures', async () => {
    const error = new Error('test error');
    const callback = vi.fn().mockRejectedValueOnce(error).mockResolvedValue('success');
    const onRetry = vi.fn();

    await idempotentCallbackWithRetry(callback, { onRetry, delayMs: 1 });

    expect(onRetry).toHaveBeenCalledWith(error, 0);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should use default retry count of 3', async () => {
    const callback = vi.fn().mockRejectedValue(new Error('fail'));

    await expect(idempotentCallbackWithRetry(callback, { delayMs: 1 })).rejects.toThrow('fail');

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('should handle custom retry count', async () => {
    const callback = vi.fn().mockRejectedValue(new Error('fail'));

    await expect(idempotentCallbackWithRetry(callback, { retries: 1, delayMs: 1 })).rejects.toThrow(
      'fail'
    );

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should preserve return type', async () => {
    const callback = vi.fn().mockResolvedValue({ data: 'test', count: 42 });

    const result = await idempotentCallbackWithRetry(callback, { delayMs: 1 });

    expect(result).toEqual({ data: 'test', count: 42 });
  });

  it('should handle zero retries', async () => {
    const callback = vi.fn().mockRejectedValue(new Error('immediate fail'));

    await expect(idempotentCallbackWithRetry(callback, { retries: 0, delayMs: 1 })).rejects.toThrow(
      'immediate fail'
    );

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should respect custom delay', async () => {
    const callback = vi.fn().mockRejectedValue(new Error('fail'));
    const start = Date.now();

    await expect(
      idempotentCallbackWithRetry(callback, { retries: 1, delayMs: 10 })
    ).rejects.toThrow('fail');

    const duration = Date.now() - start;
    expect(duration).toBeGreaterThan(8);
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
