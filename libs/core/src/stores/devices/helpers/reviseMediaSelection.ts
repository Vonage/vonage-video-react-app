import { isSinkIdSupported } from '@web/platform';
import organizeMediaDevicesByKind from './organizeMediaDevicesByKind';
import type { DevicesStoreState } from '../types';

type Result = Partial<Record<MediaDeviceKind, string | undefined>>;

/**
 * Reconciles the current media selection with the available media devices info and returns the necessary updates to make the selection valid.
 * Also tells Vonage SDK to update the audio output device if the selected audio output device is no longer valid.
 */
const reviseMediaSelection = (state: DevicesStoreState): Result | null => {
  const updates: Result = {};
  const { mediaDeviceInfo, ...selection } = state;

  const {
    audiooutput: audioOutputMap,
    audioinput: audioInputMap,
    videoinput: videoInputMap,
  } = organizeMediaDevicesByKind({ mediaDeviceInfo });

  const videoinput = (() => {
    if (selection.videoinput && videoInputMap[selection.videoinput]) {
      return selection.videoinput;
    }

    // Auto-select first available video input when current selection is invalid
    return Object.values(videoInputMap)[0]?.deviceId ?? undefined;
  })();

  const audioinput = (() => {
    if (selection.audioinput && audioInputMap[selection.audioinput]) {
      return selection.audioinput;
    }

    // Auto-select first available audio input when current selection is invalid
    return Object.values(audioInputMap)[0]?.deviceId ?? undefined;
  })();

  const audiooutput = (() => {
    // doesn't support audio output selection, nothing to revise
    if (!isSinkIdSupported()) return undefined;
    if (selection.audiooutput && audioOutputMap[selection.audiooutput]) {
      return selection.audiooutput;
    }

    return Object.values(audioOutputMap)[0]?.deviceId ?? undefined;
  })();

  const didVideoInputChange = videoinput !== selection.videoinput;
  const didAudioInputChange = audioinput !== selection.audioinput;
  const didAudioOutputChange = audiooutput !== selection.audiooutput;

  if (didVideoInputChange) updates.videoinput = videoinput;
  if (didAudioInputChange) updates.audioinput = audioinput;
  if (didAudioOutputChange) updates.audiooutput = audiooutput;

  const shouldUpdateSelection = Object.keys(updates).length > 0;
  if (!shouldUpdateSelection) return null;

  return updates;
};

export default reviseMediaSelection;
