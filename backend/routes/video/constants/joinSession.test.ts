import { describe, expect, it } from '@jest/globals';
import joinSession from './joinSession';

describe('joinSession defaults', () => {
  it('sets the client token expireTime in epoch seconds (~3h from now), not milliseconds', () => {
    const nowSeconds = Math.floor(Date.now() / 1000);

    const addDefaults = joinSession.addDefaults as (payload: unknown) => {
      clientTokenOptions: { expireTime: number };
    };
    const { expireTime } = addDefaults({}).clientTokenOptions;

    // The SDK writes expireTime straight into the JWT `exp` (epoch seconds), so it
    // must be ~now + 3h in seconds. The bug used Date.now() + milliseconds (~1.7e12).
    expect(Math.abs(expireTime - (nowSeconds + 3 * 60 * 60))).toBeLessThan(5);
    expect(expireTime).toBeLessThan(1e11);
  });
});
