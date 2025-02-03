import { describe, it, expect, vi, afterAll } from 'vitest';
import { Device } from '@vonage/client-sdk-video';
import * as util from './util';

const chromeUserAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

const safariUserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15';

const firefoxUserAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';

describe('isGetActiveAudioOutputDeviceSupported', () => {
  const originalUserAgent = navigator.userAgent;

  afterAll(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
    });
  });

  it('is not supported on Firefox', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: firefoxUserAgent,
      writable: true,
    });

    expect(util.isGetActiveAudioOutputDeviceSupported()).toBe(false);
  });

  it('is not supported on Safari', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: safariUserAgent,
      writable: true,
    });

    expect(util.isGetActiveAudioOutputDeviceSupported()).toBe(false);
  });

  it('is supported on Chrome', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: chromeUserAgent,
      writable: true,
    });

    expect(util.isGetActiveAudioOutputDeviceSupported()).toBe(true);
  });
});

describe('isWebKit', () => {
  const originalUserAgent = navigator.userAgent;

  afterAll(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
    });
  });

  it('returns true if it is Safari', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: safariUserAgent,
      writable: true,
    });

    expect(util.isWebKit()).toBe(true);
  });

  it('returns false if it is Chrome', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: chromeUserAgent,
      writable: true,
    });

    expect(util.isWebKit()).toBe(false);
  });
});

describe('getBackgroundGradient', () => {
  it('should return a linear gradient with the specified fill percentage', () => {
    const level = 50;
    const result = util.getBackgroundGradient(level);
    expect(result).toBe('linear-gradient(to top, rgba(26,115,232,.9) 50%, transparent 50%)');
  });
});

describe('getAudioSourceDeviceId', () => {
  it('returns the correct deviceId when a matching device is found', () => {
    const devices: Device[] = [
      { kind: 'audioInput', deviceId: 'device1', label: 'Microphone 1' },
      { kind: 'audioInput', deviceId: 'device2', label: 'Microphone 2' },
    ];
    const currentAudioSource = { label: 'Microphone 2' } as MediaStreamTrack;

    const result = util.getAudioSourceDeviceId(devices, currentAudioSource);
    expect(result).toBe('device2');
  });

  it('returns an empty string when no matching device is found', () => {
    const devices: Device[] = [
      { kind: 'audioInput', deviceId: 'device1', label: 'Microphone 1' },
      { kind: 'audioInput', deviceId: 'device2', label: 'Microphone 2' },
    ];
    const currentAudioSource = { label: 'Not Matching Microphone' } as MediaStreamTrack;

    const result = util.getAudioSourceDeviceId(devices, currentAudioSource);
    expect(result).toBe('');
  });
});

describe('isMobile', () => {
  it('should return false for Microsoft tablets', () => {
    const tabletUAStrings = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Windows NT 10.0; ARM64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];

    tabletUAStrings.forEach((tabletUAString) => {
      Object.defineProperty(navigator, 'userAgent', {
        value: tabletUAString,
        writable: true,
      });
      const result = util.isMobile();

      expect(result).toEqual(false);
    });
  });

  it('should return true for mobile devices', () => {
    const mobileUAStrings = [
      'Mozilla/5.0 (X11; U; Linux armv7l; en-GB; rv:1.9.2a1pre) Gecko/20090928 Firefox/3.5 Maemo Browser 1.4.1.22 RX-51 N900',
      'Mozilla/5.0 (Linux; U; Android 4.0.2; en-us; Galaxy Nexus Build/ICL53F) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.0.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Android 4.4; Mobile; rv:70.0) Gecko/70.0 Firefox/70.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4',
    ];

    mobileUAStrings.forEach((mobileUAString) => {
      Object.defineProperty(navigator, 'userAgent', {
        value: mobileUAString,
        writable: true,
      });
      const result = util.isMobile();

      expect(result).toEqual(true);
    });
  });
});
