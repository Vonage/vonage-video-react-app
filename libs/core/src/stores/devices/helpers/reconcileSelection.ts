import type { DevicesAPI } from '../types';
import { setAudioOutputDevice as setVonageAudioOutputDevice } from '@vonage/client-sdk-video';

/**
 * Call this function after syncing media devices info to reconcile the current selection
 * with the available media devices.
 */
const reconcileSelection = async ({ getState, setState }: DevicesAPI) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  const currentState = getState();
  const updates: Partial<Record<MediaDeviceKind, string | undefined>> = {};

  const videoinput = (() => {
    if (currentState.videoinput) return currentState.videoinput;
    return stream.getVideoTracks()[0]?.getSettings()?.deviceId ?? undefined;
  })();

  const audioinput = (() => {
    if (currentState.audioinput) return currentState.audioinput;
    return stream.getAudioTracks()[0]?.getSettings()?.deviceId ?? undefined;
  })();

  const audiooutput = (() => {
    if (currentState.audiooutput) return currentState.audiooutput;
    return undefined;
  })();

  const didVideoInputChange = videoinput !== currentState.videoinput;
  const didAudioInputChange = audioinput !== currentState.audioinput;
  const didAudioOutputChange = audiooutput !== currentState.audiooutput;

  if (didVideoInputChange) updates.videoinput = videoinput;
  if (didAudioInputChange) updates.audioinput = audioinput;
  if (didAudioOutputChange) updates.audiooutput = audiooutput;

  const shouldUpdateSelection = Object.keys(updates).length > 0;
  if (!shouldUpdateSelection) return;

  // concatenate new selection with the existing one
  setState((state) => ({
    ...state,
    ...updates,
  }));

  // if the audio device changed, reconcileSelection with Vonage SDK
  if (updates.audiooutput) {
    void setVonageAudioOutputDevice(updates.audiooutput);
  }
};

export default reconcileSelection;
