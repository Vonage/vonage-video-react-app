import type { Prettify } from '@common/types';

import mediaDevicesStore from './devicesStore';

import { useMediaDeviceInfo, useMediaDevices } from './hooks';
import { mediaDevicesMap$ } from './observables';

const extensions = {
  /**
   * Hook to get the selected media device info for a specific kind from the store.
   */
  useMediaDeviceInfo,

  /**
   * Hook to get all media devices info from the store.
   * You can filter by kind and use a selector to retrieve specific data.
   *
   * @example
   */
  useMediaDevices,

  /**
   * Observable map of media devices by kind.
   */
  mediaDevicesMap$,
};

// Media Devices namespace
const mediaDevices$ = Object.assign(mediaDevicesStore, extensions) as Prettify<
  Omit<
    typeof mediaDevicesStore,
    // We are removing this properties to make the public namespace smaller and easier to digest
    'select' | 'subscribe' | 'dispose' | 'subscribers'
  > &
    typeof extensions
>;

export default mediaDevices$;
