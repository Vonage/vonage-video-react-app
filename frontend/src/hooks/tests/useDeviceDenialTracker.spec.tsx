import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import useDeviceDenialTracker from '../useDeviceDenialTracker';
import watchDeviceReGrant from '@utils/publisher/watchDeviceReGrant';
import detectDeniedDevices from '@utils/publisher/detectDeniedDevices';
import { DEVICE_REACQUIRE_FALLBACK_MS, NO_DENIED_DEVICES } from '@utils/publisher/deviceAccess';
import type { AccessDeniedEvent } from '@Context/PublisherProvider/usePublisher/usePublisher';
import type { DeviceKind } from '@utils/publisher/deviceAccess';

vi.mock('@utils/publisher/watchDeviceReGrant');
vi.mock('@utils/publisher/detectDeniedDevices');

// Capture each watcher's onReGrant so tests can fire a re-grant, and hand back a detach spy so
// unmount cleanup can be asserted.
const reGrantCallbacks: Partial<Record<DeviceKind, (device: DeviceKind) => void>> = {};
const detachSpies: Partial<Record<DeviceKind, ReturnType<typeof vi.fn>>> = {};

describe('useDeviceDenialTracker', () => {
  beforeEach(() => {
    vi.mocked(watchDeviceReGrant).mockImplementation(({ device, onReGrant }) => {
      reGrantCallbacks[device] = onReGrant;
      const detach = vi.fn();
      detachSpies[device] = detach;
      return Promise.resolve(detach);
    });
    vi.mocked(detectDeniedDevices).mockResolvedValue({ microphone: true, camera: false });
  });

  afterEach(() => {
    vi.clearAllMocks();
    reGrantCallbacks.microphone = undefined;
    reGrantCallbacks.camera = undefined;
  });

  it('seeds its state from initialDenied', () => {
    const { result } = renderHook(() =>
      useDeviceDenialTracker({
        initialDenied: { microphone: true, camera: false },
        onRecover: vi.fn(),
      })
    );

    expect(result.current.deniedDevices).toEqual({ microphone: true, camera: false });
  });

  it('badges a device and watches it once for re-grant', async () => {
    const { result } = renderHook(() => useDeviceDenialTracker({ onRecover: vi.fn() }));

    act(() => {
      result.current.markDeviceDenied('microphone');
    });

    expect(result.current.deniedDevices.microphone).toBe(true);
    await waitFor(() => {
      expect(watchDeviceReGrant).toHaveBeenCalledWith(
        expect.objectContaining({ device: 'microphone' })
      );
    });

    // A duplicate mark must not stack a second watcher.
    act(() => {
      result.current.markDeviceDenied('microphone');
    });
    expect(watchDeviceReGrant).toHaveBeenCalledTimes(1);
  });

  it('clears the badge and calls onRecover when the watcher reports a re-grant', async () => {
    const onRecover = vi.fn();
    const { result } = renderHook(() => useDeviceDenialTracker({ onRecover }));

    act(() => {
      result.current.markDeviceDenied('microphone');
    });
    await waitFor(() => expect(reGrantCallbacks.microphone).toBeTypeOf('function'));

    act(() => {
      reGrantCallbacks.microphone!('microphone');
    });

    expect(result.current.deniedDevices.microphone).toBe(false);
    expect(onRecover).toHaveBeenCalledWith('microphone');
  });

  it('clearDeviceDenied un-badges without recovering', () => {
    const onRecover = vi.fn();
    const { result } = renderHook(() =>
      useDeviceDenialTracker({ initialDenied: { microphone: true, camera: false }, onRecover })
    );

    act(() => {
      result.current.clearDeviceDenied('microphone');
    });

    expect(result.current.deniedDevices.microphone).toBe(false);
    expect(onRecover).not.toHaveBeenCalled();
  });

  it('applyAccessDeniedEvent badges the resolved device and clears the granted one', async () => {
    // Mic denied, camera granted (the SDK over-reported both).
    vi.mocked(detectDeniedDevices).mockResolvedValue({ microphone: true, camera: false });
    const { result } = renderHook(() => useDeviceDenialTracker({ onRecover: vi.fn() }));

    await act(async () => {
      await result.current.applyAccessDeniedEvent({} as AccessDeniedEvent);
    });

    expect(result.current.deniedDevices).toEqual({ microphone: true, camera: false });
  });

  it('reacquireDevice recovers a still-denied device after the fallback delay (Safari fallback)', () => {
    const onRecover = vi.fn();
    const { result } = renderHook(() =>
      useDeviceDenialTracker({ initialDenied: { microphone: true, camera: false }, onRecover })
    );

    vi.useFakeTimers();
    act(() => {
      result.current.reacquireDevice('microphone');
    });
    act(() => {
      vi.advanceTimersByTime(DEVICE_REACQUIRE_FALLBACK_MS);
    });
    vi.useRealTimers();

    expect(onRecover).toHaveBeenCalledWith('microphone');
    expect(result.current.deniedDevices.microphone).toBe(false);
  });

  it('reacquireDevice does nothing when the device is no longer denied (dedup with the watcher)', () => {
    const onRecover = vi.fn();
    const { result } = renderHook(() =>
      useDeviceDenialTracker({ initialDenied: NO_DENIED_DEVICES, onRecover })
    );

    vi.useFakeTimers();
    act(() => {
      result.current.reacquireDevice('microphone');
    });
    act(() => {
      vi.advanceTimersByTime(DEVICE_REACQUIRE_FALLBACK_MS);
    });
    vi.useRealTimers();

    expect(onRecover).not.toHaveBeenCalled();
  });

  it('detaches live watchers on unmount so their permission listeners never leak', async () => {
    const { result, unmount } = renderHook(() => useDeviceDenialTracker({ onRecover: vi.fn() }));

    act(() => {
      result.current.markDeviceDenied('microphone');
    });
    await waitFor(() => expect(detachSpies.microphone).toBeTypeOf('function'));

    unmount();

    expect(detachSpies.microphone).toHaveBeenCalled();
  });
});
