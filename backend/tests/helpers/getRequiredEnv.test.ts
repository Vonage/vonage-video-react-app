import { describe, expect, it } from '@jest/globals';
import getRequiredEnv from '../../helpers/getRequiredEnv';

describe('getRequiredEnv', () => {
  it('returns the value when the variable is set', () => {
    // VONAGE_APP_ID is provided by backend/jest/setEnvVars.js
    expect(getRequiredEnv('VONAGE_APP_ID')).toBe('vonageAppId');
  });

  it('throws a descriptive error naming the missing variable', () => {
    expect(() => getRequiredEnv('SOME_UNSET_VARIABLE_XYZ')).toThrow(
      /Missing required environment variable "SOME_UNSET_VARIABLE_XYZ"/
    );
  });
});
