import { describe, it, expect } from 'vitest';
import SessionIdSchema from './SessionId.schema';

describe('SessionIdSchema', () => {
  it('should accept a valid session ID', () => {
    expect(
      SessionIdSchema.safeParse(
        '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE'
      ).success
    ).toBe(true);
  });

  it('should reject an invalid session ID', () => {
    expect(SessionIdSchema.safeParse('not-a-session-id').success).toBe(false);
  });
});
