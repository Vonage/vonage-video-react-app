import { describe, expect, it } from '@jest/globals';
import joinSession from './joinSession';
import type { JoinSessionPayload } from '@api-lib';

describe('joinSession defaults', () => {
  it('sets the client token expireTime in epoch seconds (~24 hours from now) for session migration support', () => {
    const nowSeconds = Math.floor(Date.now() / 1000);

    const transformInput = joinSession.transformInput!;
    const assertInput = (input: unknown) => input as JoinSessionPayload;
    const result = transformInput({ input: {}, assertInput });

    const { expireTime } = result.clientTokenOptions!;

    expect(Math.abs(expireTime! - (nowSeconds + 24 * 60 * 60))).toBeLessThan(5);
    expect(expireTime).toBeLessThan(1e11);
  });

  it('extends token TTL to 24 hours (not default 1 hour) to handle server rotation reconnection', () => {
    const transformInput = joinSession.transformInput!;
    const assertInput = (input: unknown) => input as JoinSessionPayload;
    const result = transformInput({ input: {}, assertInput });

    const { expireTime } = result.clientTokenOptions!;

    const nowSeconds = Math.floor(Date.now() / 1000);
    const twentyFourHoursInSeconds = 24 * 60 * 60;

    expect(Math.abs(expireTime! - (nowSeconds + twentyFourHoursInSeconds))).toBeLessThan(5);
  });

  it('discards client-provided role and expireTime to prevent security vulnerabilities', () => {
    const transformInput = joinSession.transformInput!;
    const assertInput = (input: unknown) => input as JoinSessionPayload;

    const nowSeconds = Math.floor(Date.now() / 1000);
    const maliciousPayload = {
      clientTokenOptions: {
        role: 'subscriber',
        expireTime: nowSeconds + 365 * 24 * 60 * 60,
        data: 'safe-user-data',
      },
    };

    const result = transformInput({ input: maliciousPayload, assertInput });

    expect(result.clientTokenOptions!.role).toBe('moderator');
    expect(
      Math.abs(result.clientTokenOptions!.expireTime! - (nowSeconds + 24 * 60 * 60))
    ).toBeLessThan(5);
    expect(result.clientTokenOptions!.data).toBe('safe-user-data');
  });
});
