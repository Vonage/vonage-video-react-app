import { afterEach, describe, expect, test } from 'vitest';
import jwt from 'jsonwebtoken';
import createRtcStatsUrl from './createRtcStatsUrl';

describe('createRtcStatsUrl', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  test('returns null when rtcstats is not configured', () => {
    process.env = { ...originalEnv, RTCSTATS_ENDPOINT: 'ws://localhost:3000' };
    delete process.env.RTCSTATS_JWT_SECRET;

    expect(createRtcStatsUrl({ sessionId: 'session-id', roomName: 'room' })).toBeNull();
  });

  test('signs the session and room into the rtcstats token', () => {
    process.env = {
      ...originalEnv,
      RTCSTATS_ENDPOINT: 'ws://localhost:3000',
      RTCSTATS_JWT_SECRET: 'rtcstats-secret',
    };

    const url = new URL(createRtcStatsUrl({ sessionId: 'session-id', roomName: 'room' })!);
    const token = url.searchParams.get('rtcstats-token')!;

    expect(url.origin).toBe('ws://localhost:3000');
    expect(jwt.verify(token, 'rtcstats-secret')).toMatchObject({
      rtcStats: { conference: 'room', session: 'session-id' },
    });
  });
});
