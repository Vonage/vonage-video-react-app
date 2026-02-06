import { createGlobalState, type InferAPI } from 'react-global-state-hooks';
import { syncMediaDevicesInfo, selectDevice, getUserMedia } from './actions';
import { initialValue, metadata } from './constants';
import { setupDeviceStore } from './helpers';
import type { DevicesStoreState } from './types';
import { safelyParseDevicesStoreState } from './schemas/DevicesStoreState.schema';

export type MediaDevicesAPI = InferAPI<typeof mediaDevicesStore>;

/**
 * MediaDevices Store
 * Handles media devices information and selection
 */
const mediaDevicesStore = createGlobalState(initialValue, {
  metadata,
  actions: {
    /**
     * Manually syncs the media devices info from navigator.mediaDevices
     * [IMPORTANT] You usually don't need to call this method manually as the store is already
     * listening to devicechange events (if supported by the platform).
     */
    syncMediaDevicesInfo,

    /**
     * Selects a media device by kind and deviceId
     */
    selectDevice,

    /**
     * Gets user media with specified constraints
     * Use this method instead of directly calling navigator.mediaDevices.getUserMedia to keep
     * the store in sync with granted media permissions.
     */
    getUserMedia,
  },
  localStorage: {
    key: 'vera-devices-store',
    validator: ({ restored, initial }) => {
      const { error } = safelyParseDevicesStoreState(restored);
      if (!error) return restored;

      // Log warning if restored state is invalid
      if (error && restored) {
        console.warn(
          '[MediaDevicesStore] Restored state from localStorage is invalid, using initial state instead.',
          error
        );
      }

      return initial as DevicesStoreState;
    },
    selector: (state) => {
      const { videoinput, audioinput, audiooutput } = state as DevicesStoreState;
      return {
        videoinput,
        audioinput,
        audiooutput,
      };
    },
  },
  callbacks: {
    onInit: (api) => {
      return setupDeviceStore(api);
    },
  },
});

export default mediaDevicesStore;
