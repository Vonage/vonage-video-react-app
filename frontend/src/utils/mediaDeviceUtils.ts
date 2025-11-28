import { Publisher } from '@vonage/client-sdk-video';
import { RefObject } from 'react';
import { getAudioSourceDeviceId } from './util';
import { AllMediaDevices } from '../types/room';

/**
 * Helper to update the media devices state with the current media devices of a given publisher.
 * @param {RefObject<Publisher | null>} publisherRef - The publisher ref object.
 * @param {AllMediaDevices} allMediaDevices - All video input, audio input, audio output devices for a user.
 * @param {(deviceId: string) => void} setLocalAudioSource - SetStateAction for the audio input.
 * @param {(deviceId: string) => void} setLocalVideoSource - SetStateAction for the video input.
 * @returns {void} - A promise that resolves after setting current media devices' state.
 */
const setMediaDevices = (
  publisherRef: RefObject<Publisher | null>,
  allMediaDevices: AllMediaDevices,
  setLocalAudioSource: (deviceId: string) => void,
  setLocalVideoSource: (deviceId: string) => void
): void => {
  if (!publisherRef.current || !allMediaDevices) {
    return;
  }

  const currentVideoDevice = publisherRef.current.getVideoSource();
  const currentAudioDevice = publisherRef.current.getAudioSource();

  const audioSourceId = getAudioSourceDeviceId(
    allMediaDevices.audioInputDevices,
    currentAudioDevice
  );

  if (!audioSourceId || !currentVideoDevice.deviceId) {
    return;
  }

  setLocalAudioSource(audioSourceId);

  if (typeof currentVideoDevice?.deviceId === 'string') {
    setLocalVideoSource(currentVideoDevice.deviceId);
  }
};

export default setMediaDevices;
