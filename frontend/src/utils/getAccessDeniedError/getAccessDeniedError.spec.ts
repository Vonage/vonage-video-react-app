import { describe, expect, it } from 'vitest';
import getAccessDeniedError from './getAccessDeniedError';

describe('getAccessDeniedError', () => {
  ['Camera', 'Microphone'].forEach((device) => {
    it(`returns an accessDenied error message for ${device}`, () => {
      const accessDeniedError = getAccessDeniedError(device);

      expect(accessDeniedError?.header).toEqual(`${device} access is denied`);
      expect(accessDeniedError?.caption).toEqual(
        `It seems your browser is blocked from accessing your ${device.toLowerCase()}. Reset the permission state through your browser's UI.`
      );
    });
  });
});
