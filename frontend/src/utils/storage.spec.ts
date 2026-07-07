import { describe, it, expect, vi, afterEach } from 'vitest';
import { getStorageItem, setStorageItem } from './storage';

describe('storage utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not throw when localStorage.setItem fails (Safari private mode / quota exceeded)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    });

    expect(() => setStorageItem('username', 'ada')).not.toThrow();
  });

  it('returns null when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    expect(getStorageItem('username')).toBeNull();
  });
});
