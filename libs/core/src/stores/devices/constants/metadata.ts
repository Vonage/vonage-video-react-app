import type CancelablePromise from 'easy-cancelable-promise';
import type { AudioOutputDevice } from '../types';
import type { InitialValue } from './initialValue';

const metadata = {
  // promises to track loading state
  loadingDevices: null as null | CancelablePromise<InitialValue['devices']>,

  loadingAudioOutputDevices: null as null | CancelablePromise<InitialValue['audioOutputDevices']>,

  loadingMediaDevices: null as null | CancelablePromise<MediaDeviceInfo[]>,

  // temporary backup for the local storage restored value
  restoredAudioOutput: null as AudioOutputDevice | null,
};

export type Metadata = typeof metadata;

export default metadata;
