import { describe, it, expect } from 'vitest';
import type { TFunction } from 'i18next';
import deniedDevicesLabel from './deniedDevicesLabel';

// Identity translation so we can assert which i18n key was chosen without loading locales.
const t = ((key: string) => key) as unknown as TFunction;

describe('deniedDevicesLabel', () => {
  it('labels a camera-only denial', () => {
    expect(deniedDevicesLabel({ microphone: false, camera: true }, t)).toBe(
      'deviceAccessHint.camera'
    );
  });

  it('labels a microphone-only denial', () => {
    expect(deniedDevicesLabel({ microphone: true, camera: false }, t)).toBe(
      'deviceAccessHint.microphone'
    );
  });

  it('labels a combined denial', () => {
    expect(deniedDevicesLabel({ microphone: true, camera: true }, t)).toBe(
      'deviceAccessHint.cameraAndMicrophone'
    );
  });
});
