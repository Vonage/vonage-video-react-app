import { describe, it, expect } from 'vitest';
import { hasDeniedDevice, NO_DENIED_DEVICES } from './deviceAccess';

describe('hasDeniedDevice', () => {
  it('is false when no device is denied', () => {
    expect(hasDeniedDevice(NO_DENIED_DEVICES)).toBe(false);
  });

  it('is true when the microphone is denied', () => {
    expect(hasDeniedDevice({ microphone: true, camera: false })).toBe(true);
  });

  it('is true when the camera is denied', () => {
    expect(hasDeniedDevice({ microphone: false, camera: true })).toBe(true);
  });
});
