import { describe, it, expect } from 'vitest';
import tryCatch from './';

describe('tryCatch', () => {
  describe('synchronous operations', () => {
    it('should return result when callback succeeds', () => {
      const { result, error } = tryCatch(() => 42);

      expect(result).toBe(42);
      expect(error).toBeNull();
    });

    it('should return error when callback throws', () => {
      const testError = new Error('test error');

      const { result, error } = tryCatch((): number => {
        throw testError;
      });

      expect(result).toBeNull();
      expect(error).toBe(testError);
    });

    it('should return fallback value on error when provided', () => {
      const { result, error } = tryCatch((): string => {
        throw new Error('error');
      }, 'fallback');

      expect(result).toBe('fallback');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('asynchronous operations', () => {
    it('should return result when async callback succeeds', async () => {
      const { result, error } = await tryCatch(() => Promise.resolve(42));

      expect(result).toBe(42);
      expect(error).toBeNull();
    });

    it('should return error when async callback rejects', async () => {
      const testError = new Error('async error');

      const { result, error } = await tryCatch((): Promise<number> => {
        throw testError;
      });

      expect(result).toBeNull();
      expect(error).toBe(testError);
    });

    it('should return fallback value on async error when provided', async () => {
      const { result, error } = await tryCatch((): Promise<string> => {
        throw new Error('error');
      }, 'async fallback');

      expect(result).toBe('async fallback');
      expect(error).toBeInstanceOf(Error);
    });
  });
});
