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
    // must be ~now + 24 hours in seconds. While Video API tokens can be valid for up to 30 days,
    // we use 24 hours for better security as tokens are regenerated on each joinSession call.
    // Reference: https://api.support.vonage.com/hc/en-us/articles/26669850825116
    const twentyFourHoursInSeconds = 24 * 60 * 60;
    expect(Math.abs(expireTime - (nowSeconds + twentyFourHoursInSeconds))).toBeLessThan(5);
    expect(expireTime).toBeLessThan(1e11);
  });
});
