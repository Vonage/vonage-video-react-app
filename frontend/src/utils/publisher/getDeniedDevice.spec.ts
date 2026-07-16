import { describe, expect, it } from 'vitest';
import getDeniedDevice from './getDeniedDevice';

describe('getDeniedDevice', () => {
  it('identifies the microphone from the SDK lowercase mid-call revocation message', () => {
    expect(getDeniedDevice('microphone permission denied during the call')).toBe('microphone');
  });

  it('identifies the microphone regardless of message casing', () => {
    expect(getDeniedDevice('Microphone permission denied during the call')).toBe('microphone');
  });

  it('falls back to the camera for messages naming any other device', () => {
    expect(getDeniedDevice('camera permission denied during the call')).toBe('camera');
    expect(getDeniedDevice(undefined)).toBe('camera');
  });
});
