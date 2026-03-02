import mediaDevices$ from '@core/stores/devices';

// reverted filter by mobile camera
// import filterMobileCameras from './helpers/filterMobileCameras';

/**
 * React hook that returns filtered video input devices for camera selection.
 *
 * On mobile devices, filters to only one primary front-facing and one primary rear-facing camera.
 * This prevents issues with devices that enumerate multiple physical cameras where only one front
 * and one rear camera actually function correctly.
 *
 * On non-mobile devices, returns all available video input devices unchanged.
 *
 * @returns Filtered array containing at most one front and one rear camera on mobile, or all video input devices on desktop.
 */
const usePreferredCameras = mediaDevices$.mediaDevicesMap$.createSelectorHook(
  (state) => Object.values(state.videoinput),
  {
    // avoid re-computing unless the videoinput devices change
    isEqualRoot: (a, b) => a.videoinput === b.videoinput,
  }
);

export default usePreferredCameras;
