import { describe, it, expect } from 'vitest';
import isSessionKeyLike from './isSessionKeyLike';

describe('isSessionKeyLike', () => {
  it('should distinguish session keys from plain room names', () => {
    expect(isSessionKeyLike('eyJhbGciOiJIUzI1NiJ9.eyJzZXNzaW9uSWQiOiIxX01YNH0.abc123def456')).toBe(
      true
    );
    expect(isSessionKeyLike('my-room')).toBe(false);
  });
});
