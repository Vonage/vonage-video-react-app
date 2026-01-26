import type CancelablePromise from 'easy-cancelable-promise';
import type { AudioOutputDevice } from '../types';
import type { NativeMediaDeviceInfo } from '../schemas';
import type { InitialValue } from './initialValue';

const metadata = {
  // promises to track loading state
  loadingDevices: null as null | CancelablePromise<InitialValue['devices']>,

  loadingAudioOutputDevices: null as null | CancelablePromise<InitialValue['audioOutputDevices']>,

  loadingMediaDevices: null as null | CancelablePromise<NativeMediaDeviceInfo[]>,

  // temporary backup for the local storage restored value
  restoredAudioOutput: null as AudioOutputDevice | null,
  restoredAudioInput: null as NativeMediaDeviceInfo | null,
  restoredVideoInput: null as NativeMediaDeviceInfo | null,
};

export type Metadata = typeof metadata;

export default metadata;
