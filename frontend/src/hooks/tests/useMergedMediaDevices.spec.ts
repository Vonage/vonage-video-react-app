import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useMergedMediaDevices from '../useMergedMediaDevices';
import type { MediaDeviceInfoJSON } from '@web/types';

const makeDevice = (deviceId: string, label: string, kind: MediaDeviceKind = 'audiooutput') =>
  ({ deviceId, label, kind, groupId: '' }) as MediaDeviceInfoJSON;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'devices.defaultLabel': 'System Default',
        'devices.label.builtIn': 'Built-in',
        'devices.label.defaultPrefix': 'Default',
      };
      return map[key] ?? key;
    },
    i18n: { language: 'en' },
  }),
}));

vi.mock('@ui/hooks', () => ({
  useDistinctLabelMediaDevices: vi.fn(),
}));

import { useDistinctLabelMediaDevices } from '@ui/hooks';

const mockUseDistinctLabelMediaDevices = vi.mocked(useDistinctLabelMediaDevices);

describe('useMergedMediaDevices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when no virtual "default" device is present', () => {
    it('returns all devices unchanged with null systemDefaultDeviceId', () => {
      mockUseDistinctLabelMediaDevices.mockImplementation((kind, selector) => {
        const devices = [
          makeDevice('abc', 'MacBook Pro Speakers'),
          makeDevice('def', 'USB Headset'),
        ];
        return selector ? selector(devices) : devices;
      });

      const { result } = renderHook(() => useMergedMediaDevices('audiooutput'));

      expect(result.current.devices).toHaveLength(2);
      expect(result.current.systemDefaultDeviceId).toBeNull();
    });
  });

  describe('when virtual "default" device is present', () => {
    beforeEach(() => {
      mockUseDistinctLabelMediaDevices.mockImplementation((kind, selector) => {
        const devices = [
          makeDevice('default', 'Default - MacBook Pro Speakers'),
          makeDevice('abc', 'MacBook Pro Speakers'),
          makeDevice('def', 'USB Headset'),
        ];
        return selector ? selector(devices) : devices;
      });
    });

    it('removes the virtual "default" device', () => {
      const { result } = renderHook(() => useMergedMediaDevices('audiooutput'));

      expect(result.current.devices.find((d) => d.deviceId === 'default')).toBeUndefined();
    });

    it('appends system-default suffix to the matching real device', () => {
      const { result } = renderHook(() => useMergedMediaDevices('audiooutput'));

      const matched = result.current.devices.find((d) => d.deviceId === 'abc');
      expect(matched?.label).toBe('MacBook Pro Speakers - System Default');
    });

    it('sets systemDefaultDeviceId to the matching real deviceId', () => {
      const { result } = renderHook(() => useMergedMediaDevices('audiooutput'));

      expect(result.current.systemDefaultDeviceId).toBe('abc');
    });
  });

  describe('label translation', () => {
    it('translates "Built-in" in device labels', () => {
      mockUseDistinctLabelMediaDevices.mockImplementation((kind, selector) => {
        const devices = [
          makeDevice('default', 'Default - MacBook Pro Speakers (Built-in)'),
          makeDevice('abc', 'MacBook Pro Speakers (Built-in)'),
        ];
        return selector ? selector(devices) : devices;
      });

      const { result } = renderHook(() => useMergedMediaDevices('audiooutput'));

      const matched = result.current.devices.find((d) => d.deviceId === 'abc');
      expect(matched?.label).toContain('Built-in');
    });
  });

  describe('selector', () => {
    it('applies selector before merging', () => {
      mockUseDistinctLabelMediaDevices.mockImplementation((kind, selector) => {
        const devices = [
          makeDevice('default', 'Default - MacBook Pro Speakers', 'audioinput'),
          makeDevice('abc', 'MacBook Pro Speakers', 'audioinput'),
        ];
        return selector ? selector(devices) : devices;
      });

      const selector = (devices: MediaDeviceInfoJSON[]) =>
        devices.map((d) => ({ ...d, label: d.label ?? 'Unknown device' }));

      const { result } = renderHook(() => useMergedMediaDevices('audioinput', selector));

      expect(result.current.systemDefaultDeviceId).toBe('abc');
      result.current.devices.forEach((d) => {
        expect(d.label).toBeTruthy();
      });
    });
  });
});
