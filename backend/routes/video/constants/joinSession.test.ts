import { describe, expect, it } from '@jest/globals';
import joinSession from './joinSession';

describe('joinSession defaults', () => {
  it('sets the client token expireTime in epoch seconds (~24 hours from now) for session migration support', () => {
    const nowSeconds = Math.floor(Date.now() / 1000);

    const addDefaults = joinSession.addDefaults as (payload: unknown) => {
      clientTokenOptions: { expireTime: number };
    };
    const { expireTime } = addDefaults({}).clientTokenOptions;

    // The SDK writes expireTime straight into the JWT `exp` (epoch seconds), so it
    // must be ~now + 24h in seconds. The old bug used Date.now() + milliseconds (~1.7e12).
    expect(Math.abs(expireTime - (nowSeconds + 24 * 60 * 60))).toBeLessThan(5);
    expect(expireTime).toBeLessThan(1e11);
  });

  it('extends token TTL to 24 hours (not default 1 hour) to handle server rotation reconnection', () => {
    const addDefaults = joinSession.addDefaults as (payload: unknown) => {
      clientTokenOptions: { expireTime: number };
    };
    const { expireTime } = addDefaults({}).clientTokenOptions;

    const nowSeconds = Math.floor(Date.now() / 1000);
    const twentyFourHoursInSeconds = 24 * 60 * 60;

    expect(Math.abs(expireTime - (nowSeconds + twentyFourHoursInSeconds))).toBeLessThan(5);
  });

  it('discards client-provided role and expireTime to prevent security vulnerabilities', () => {
    const addDefaults = joinSession.addDefaults as (payload: {
      clientTokenOptions?: {
        role?: string;
        expireTime?: number;
        data?: string;
      };
    }) => {
      clientTokenOptions: {
        role: string;
        expireTime: number;
        data?: string;
      };
    };

    const nowSeconds = Math.floor(Date.now() / 1000);
    const maliciousPayload = {
      clientTokenOptions: {
        role: 'subscriber', // Attempt privilege escalation
        expireTime: nowSeconds + 365 * 24 * 60 * 60, // Attempt to create 1-year token
        data: 'safe-user-data', // This should be preserved
      },
    };

    const result = addDefaults(maliciousPayload);

    // Server-controlled values cannot be overridden
    expect(result.clientTokenOptions.role).toBe('moderator');
    expect(
      Math.abs(result.clientTokenOptions.expireTime - (nowSeconds + 24 * 60 * 60))
    ).toBeLessThan(5);

    // Safe client data should be preserved
    expect(result.clientTokenOptions.data).toBe('safe-user-data');
  });
});
