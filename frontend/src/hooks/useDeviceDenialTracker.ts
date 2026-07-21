import { useCallback, useEffect, useRef, useState } from 'react';
import type { AccessDeniedEvent } from '@Context/PublisherProvider/usePublisher/usePublisher';
import type { DeniedDevices, DeviceKind } from '@utils/publisher/deviceAccess';
import {
  DEVICE_KINDS,
  DEVICE_REACQUIRE_FALLBACK_MS,
  NO_DENIED_DEVICES,
} from '@utils/publisher/deviceAccess';
import detectDeniedDevices from '@utils/publisher/detectDeniedDevices';
import watchDeviceReGrant from '@utils/publisher/watchDeviceReGrant';

export type DeviceDenialTracker = {
  deniedDevices: DeniedDevices;
  markDeviceDenied: (device: DeviceKind) => void;
  clearDeviceDenied: (device: DeviceKind) => void;
  applyAccessDeniedEvent: (event: AccessDeniedEvent) => Promise<DeniedDevices>;
  reacquireDevice: (device: DeviceKind) => void;
};

/**
 * The single denied-device pipeline shared by every publisher (waiting-room preview, in-call,
 * background/effects): tracks WHICH devices the browser has blocked, watches each blocked device's
 * permission, and hands a re-granted device back to the owning publisher to recover in place
 * (Google Meet style).
 *
 * The tracker owns what is identical everywhere — attribution, badge state, re-grant watching and
 * the Safari click-to-re-prompt fallback. What genuinely differs per publisher is only HOW it
 * re-acquires a recovered device (the in-call publisher destroys itself so useMeetingRoom re-inits;
 * the preview rebuilds in place via ACCESS_CHANGED; the background publisher re-enables its video),
 * so that arrives as the `onRecover` callback.
 * @param {{ initialDenied?: DeniedDevices, onRecover: (device: DeviceKind) => void }} args -
 *   `initialDenied` seeds the state synchronously (the waiting-room denial carried into the call
 *   must be excluded from the publisher's FIRST getUserMedia); `onRecover` re-acquires a re-granted
 *   device (read via a ref, so an unstable callback never re-wires watchers).
 * @returns {DeviceDenialTracker} the denied-device state and transitions.
 */
const useDeviceDenialTracker = ({
  initialDenied,
  onRecover,
}: {
  initialDenied?: DeniedDevices;
  onRecover: (device: DeviceKind) => void;
}): DeviceDenialTracker => {
  const [deniedDevices, setDeniedDevices] = useState<DeniedDevices>(
    () => initialDenied ?? NO_DENIED_DEVICES
  );
  // Mirror so the delayed reacquire fallback reads the latest value when deciding whether the
  // permission watcher already recovered the device.
  const deniedDevicesRef = useRef(deniedDevices);
  deniedDevicesRef.current = deniedDevices;

  const onRecoverRef = useRef(onRecover);
  onRecoverRef.current = onRecover;

  // Per-device detach functions for the permission watchers. `permissions.query` hands back a fresh
  // PermissionStatus each call, so an undetached listener from a prior denial would stay live and a
  // later re-denial would stack a second watcher.
  const watchersRef = useRef(new Map<DeviceKind, (() => void) | null>());

  const recoverGrantedDevice = useCallback((device: DeviceKind) => {
    watchersRef.current.get(device)?.();
    watchersRef.current.delete(device);
    setDeniedDevices((previous) =>
      previous[device] ? { ...previous, [device]: false } : previous
    );
    onRecoverRef.current(device);
  }, []);

  // Badge a blocked device and (once) watch it for re-grant so we can recover in place. The
  // synchronous null marker prevents a duplicate call from stacking a second watcher while the
  // permission query is still resolving.
  const markDeviceDenied = useCallback(
    (device: DeviceKind) => {
      setDeniedDevices((previous) =>
        previous[device] ? previous : { ...previous, [device]: true }
      );

      if (watchersRef.current.has(device)) {
        return;
      }
      watchersRef.current.set(device, null);

      void watchDeviceReGrant({ device, onReGrant: recoverGrantedDevice }).then((detach) => {
        if (!detach) {
          return;
        }
        if (watchersRef.current.has(device)) {
          watchersRef.current.set(device, detach);
        } else {
          // Recovered before the query resolved — detach now so the listener never leaks.
          detach();
        }
      });
    },
    [recoverGrantedDevice]
  );

  // Clear a device that turned out to be granted — correcting an over-seed so a still-granted
  // device is never left badged (which would also block its re-acquisition).
  const clearDeviceDenied = useCallback((device: DeviceKind) => {
    watchersRef.current.get(device)?.();
    watchersRef.current.delete(device);
    setDeniedDevices((previous) =>
      previous[device] ? { ...previous, [device]: false } : previous
    );
  }, []);

  // Resolve an SDK accessDenied event into the full denied set (seed from the event, refine via the
  // Permissions API) and apply it: denied devices get badged + watched, granted ones cleared.
  const applyAccessDeniedEvent = useCallback(
    async (event: AccessDeniedEvent): Promise<DeniedDevices> => {
      const denied = await detectDeniedDevices(event);
      DEVICE_KINDS.forEach((device) => {
        if (denied[device]) {
          markDeviceDenied(device);
        } else {
          clearDeviceDenied(device);
        }
      });
      return denied;
    },
    [markDeviceDenied, clearDeviceDenied]
  );

  // Manual fallback for the click-to-re-prompt path. Safari never fires PermissionStatus change
  // events for camera/microphone, so after a successful getUserMedia from the badge click we recover
  // here instead of via the watcher. Deferred by a grace period and gated on the device still being
  // denied, so on Chrome (where the watcher already recovered it) this no-ops — no double rebuild.
  const reacquireDevice = useCallback(
    (device: DeviceKind) => {
      window.setTimeout(() => {
        if (!deniedDevicesRef.current[device]) {
          return;
        }
        recoverGrantedDevice(device);
      }, DEVICE_REACQUIRE_FALLBACK_MS);
    },
    [recoverGrantedDevice]
  );

  useEffect(() => {
    const watchers = watchersRef.current;
    return () => {
      watchers.forEach((detach) => detach?.());
      watchers.clear();
    };
  }, []);

  return {
    deniedDevices,
    markDeviceDenied,
    clearDeviceDenied,
    applyAccessDeniedEvent,
    reacquireDevice,
  };
};

export default useDeviceDenialTracker;
