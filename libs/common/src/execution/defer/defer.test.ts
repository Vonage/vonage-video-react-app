import { describe, it, expect } from 'vitest';
import defer from './';

describe('defer', () => {
  it('should resolve the promise', async () => {
    const deferred = defer<string>();

    deferred.resolve('test value');

    await expect(deferred.promise).resolves.toBe('test value');
  });

  it('should reject the promise', async () => {
    const deferred = defer<string>();

    deferred.reject(new Error('test error'));

    await expect(deferred.promise).rejects.toThrow('test error');
  });
});
