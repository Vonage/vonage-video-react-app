import {
  getActiveAudioOutputDevice as getVonageActiveAudioOutputDevice,
  setAudioOutputDevice as setVonageAudioOutputDevice,
} from '@vonage/client-sdk-video';
import { useCallback, useEffect, useState } from 'react';

export type AudioDeviceId = string | null | undefined;

export type AudioOutputContextType = {
  currentAudioOutputDevice: string | undefined | null;
  setAudioOutputDevice: (deviceId: AudioDeviceId) => Promise<void>;
};

export type AudioOutputContextInitialValue = Partial<
  Pick<AudioOutputContextType, 'currentAudioOutputDevice'>
>;

/**
 * Hook wrapper for managing the user's audio output device.
 * @property {string | undefined | null} audioOutput - React state showing the audio output device ID, if set
 * @property {() => void} setAudioOutput - React state method to set the audioOutput device
 * @returns {AudioOutputContextType} audioOutput context
 */
const useAudioOutput = (initialValue?: AudioOutputContextInitialValue): AudioOutputContextType => {
  const [currentAudioOutputDevice, setCurrentAudioOutputDevice] = useState<AudioDeviceId>(
    initialValue?.currentAudioOutputDevice ?? null
  );
  const { mediaDevices } = window.navigator;

  const updateCurrentAudioOutputDevice = useCallback(() => {
    getVonageActiveAudioOutputDevice().then((audioOutputDevice) => {
      if (audioOutputDevice.deviceId) {
        setCurrentAudioOutputDevice(audioOutputDevice.deviceId);
      }
    });
  }, []);

  useEffect(() => {
    updateCurrentAudioOutputDevice();
  }, [updateCurrentAudioOutputDevice]);

  useEffect(() => {
    // Add an event listener to update device list when the list changes (such as plugging or unplugging a device)
    mediaDevices.addEventListener('devicechange', updateCurrentAudioOutputDevice);

    return () => {
      // Remove the event listener when component unmounts
      mediaDevices.removeEventListener('devicechange', updateCurrentAudioOutputDevice);
    };
  }, [mediaDevices, updateCurrentAudioOutputDevice]);

  const setAudioOutputDevice = useCallback(async (deviceId: AudioDeviceId) => {
    if (deviceId) {
      await setVonageAudioOutputDevice(deviceId);
      setCurrentAudioOutputDevice(deviceId);
    }
  }, []);

  return {
    currentAudioOutputDevice,
    setAudioOutputDevice,
  };
};

export default useAudioOutput;
