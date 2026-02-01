import type CancelablePromise from 'easy-cancelable-promise';
import type { AudioOutputDevice, NativeMediaDeviceInfo } from '../../../types';
import type { VonageDevice } from '../../../schemas';

export type SetupAPI = {
  syncAudioOutputDevicesList: () => CancelablePromise<AudioOutputDevice[]>;
  syncDevicesList: () => CancelablePromise<VonageDevice[]>;
  syncMediaDevicesList: () => CancelablePromise<NativeMediaDeviceInfo[]>;
};
