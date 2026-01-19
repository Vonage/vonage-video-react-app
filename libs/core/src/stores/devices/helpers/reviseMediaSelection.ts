import { setAudioOutputDevice as setVonageAudioOutputDevice } from '@vonage/client-sdk-video';
import type { DevicesAPI } from '../types';
import { isSinkIdSupported } from '@common/platform';
import { attempt } from '@common/execution';
import organizeMediaDevicesByKind from './organizeMediaDevicesByKind';

/**
 * This helper function revises the media selection based on the provided media stream and the current selection.
 * It checks if the current selection is still valid with the new media stream and updates it if necessary.
 * This is particularly useful after syncing media devices info, as the available devices may have changed.
 */
const reviseMediaSelection = ({
  videoStream,
  audioStream,
  store,
}: {
  videoStream: MediaStream;
  audioStream: MediaStream;
  store: DevicesAPI;
}) => {
  const updates: Partial<Record<MediaDeviceKind, string | undefined>> = {};
  const { mediaDeviceInfo, ...selection } = store.getState();

  const {
    audiooutput: audioOutputMap,
    audioinput: audioInputMap,
    videoinput: videoInputMap,
  } = organizeMediaDevicesByKind({ mediaDeviceInfo });

  const videoinput = (() => {
    if (selection.videoinput && videoInputMap[selection.videoinput]) {
      return selection.videoinput;
    }

    return videoStream.getVideoTracks()[0]?.getSettings()?.deviceId ?? undefined;
  })();

  const audioinput = (() => {
    if (selection.audioinput && audioInputMap[selection.audioinput]) {
      return selection.audioinput;
    }

    return audioStream.getAudioTracks()[0]?.getSettings()?.deviceId ?? undefined;
  })();

  const audiooutput = (() => {
    // doesn't support audio output selection, nothing to revise
    if (!isSinkIdSupported()) return undefined;
    if (selection.audiooutput && audioOutputMap[selection.audiooutput]) {
      return selection.audiooutput;
    }

    return (
      audioOutputMap.default?.deviceId ?? Object.values(audioOutputMap)[0]?.deviceId ?? undefined
    );
  })();

  const didVideoInputChange = videoinput !== selection.videoinput;
  const didAudioInputChange = audioinput !== selection.audioinput;
  const didAudioOutputChange = audiooutput !== selection.audiooutput;

  if (didVideoInputChange) updates.videoinput = videoinput;
  if (didAudioInputChange) updates.audioinput = audioinput;
  if (didAudioOutputChange) updates.audiooutput = audiooutput;

  const shouldUpdateSelection = Object.keys(updates).length > 0;
  if (!shouldUpdateSelection) return;

  store.setState((state) => ({
    ...state,
    ...updates,
  }));

  if (updates.audiooutput) {
    // if the audio device changed, reconcileSelection with Vonage SDK
    void attempt(() => setVonageAudioOutputDevice(audiooutput!));
  }
};

export default reviseMediaSelection;
