import { describe, it, expect } from 'vitest';
import decodeSessionKey from './decodeSessionKey';

describe('decodeSessionKey', () => {
  it('includes a well-formed schedule and omits absent or malformed schedules', () => {
    const sessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';
    const decodeSchedule = (schedule: unknown) => {
      const sessionKey = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ sessionId, schedule }))}.signature`;
      return decodeSessionKey({ sessionKey }).schedule;
    };

    expect(decodeSchedule({ startsAtMs: 1, endsAtMs: 3_600_001 })).toEqual({
      startsAtMs: 1,
      endsAtMs: 3_600_001,
    });
    expect(decodeSchedule(undefined)).toBeUndefined();
    expect(decodeSchedule({ startsAtMs: '1', endsAtMs: 3_600_001 })).toBeUndefined();
  });
});
