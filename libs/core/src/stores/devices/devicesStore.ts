import { createGlobalState, type InferAPI } from 'react-global-state-hooks';
import { safelyParseDevicesStoreState } from './schemas/DevicesStoreState.schema';
import { syncMediaDevicesInfo, selectDevice } from './actions';
import { initialValue, metadata } from './constants';
import { setupDeviceStore } from './helpers';
import type { DevicesStoreState } from './types';

export type DevicesAPI = InferAPI<typeof devicesStore>;

/**
 * Devices Store
 * Handles media devices information and selection
 */
const devicesStore = createGlobalState(initialValue, {
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
  },
  localStorage: {
    key: 'vera-devices-store',
    validator: ({ restored, initial }) => {
      const { error } = safelyParseDevicesStoreState(restored);
      if (!error) return restored;

      // Log warning if restored state is invalid
      if (error && restored) {
        console.warn(
          '[DevicesStore] Restored state from localStorage is invalid, using initial state instead.',
          error
        );
      }

      return initial as DevicesStoreState;
    },
    selector: (state) => {
      const { selection } = state as DevicesStoreState;
      return {
        selection,
      };
    },
  },
  callbacks: {
    onInit: (api) => {
      return setupDeviceStore(api);
    },
  },
});

export default devicesStore;
