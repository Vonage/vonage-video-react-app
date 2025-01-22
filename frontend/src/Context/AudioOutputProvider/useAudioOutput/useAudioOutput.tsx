import { useCallback, useEffect, useState } from 'react';
import { getActiveAudioOutputDevice, setAudioOutputDevice } from '@vonage/client-sdk-video';

export type AudioDeviceId = string | null | undefined;

export type AudioOutputContextType = {
  audioOutput: string | undefined | null;
  setAudioOutput: (deviceId: AudioDeviceId) => Promise<void>;
};

/**
 * Hook wrapper for managing the user's audio output device.
 * @property {string | undefined | null} audioOutput - React state showing the audio output device ID, if set
 * @property {() => void} setAudioOutput - React state method to set the audioOutput device
 * @returns {AudioOutputContextType} audioOutput context
 */
const useAudioOutput = (): AudioOutputContextType => {
  const [audioOutput, setAudioOutput] = useState<AudioDeviceId>();

  useEffect(() => {
    debugger;
    getActiveAudioOutputDevice().then((audioOutputDevice) => {
      debugger;
      if (audioOutputDevice.deviceId) {
        setAudioOutput(audioOutputDevice.deviceId);
      }
    });
  }, []);

  const updateAudioOutput = useCallback(async (deviceId: AudioDeviceId) => {
    if (deviceId) {
      await setAudioOutputDevice(deviceId);
      setAudioOutput(deviceId);
    }
  }, []);

  return {
    audioOutput,
    setAudioOutput: updateAudioOutput,
  };
};

export default useAudioOutput;
