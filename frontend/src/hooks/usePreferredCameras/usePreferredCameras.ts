import mediaDevices$ from '@core/stores/devices';
import filterMobileCameras from './helpers/filterMobileCameras';

/**
 * React hook that returns filtered video input devices for camera selection.
 *
 * On mobile devices, limits to at most one primary front-facing and one primary rear-facing camera,
 * plus any cameras that do not match front/rear label patterns (e.g. USB webcams). This prevents
 * issues with devices that enumerate multiple physical cameras where only one front and one rear
 * camera actually function correctly.
 *
 * On non-mobile devices, returns all available video input devices unchanged.
 *
 * @returns Filtered array: on mobile, at most one front + one rear + unknown cameras; on desktop, all video input devices.
 */
const usePreferredCameras = mediaDevices$.mediaDevicesMap$.createSelectorHook(
  (state) => filterMobileCameras(Object.values(state.videoinput)),
  {
    // avoid re-computing unless the videoinput devices change
    isEqualRoot: (a, b) => a.videoinput === b.videoinput,
  }
);

export default usePreferredCameras;
