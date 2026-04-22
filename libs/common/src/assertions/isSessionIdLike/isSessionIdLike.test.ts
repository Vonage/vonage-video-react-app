import { describe, it, expect } from 'vitest';
import isSessionIdLike from './isSessionIdLike';

describe('isSessionIdLike', () => {
  it('should distinguish session ids from plain room names', () => {
    expect(
      isSessionIdLike('1_MX4xMjM0NTY3OH4VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE')
    ).toBe(true);
    expect(isSessionIdLike('my-room')).toBe(false);
  });
});
