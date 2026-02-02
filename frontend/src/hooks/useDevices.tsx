import { useState, useEffect, useCallback } from 'react';
import { getDevices, getAudioOutputDevices } from '@vonage/client-sdk-video';
import { useTranslation } from 'react-i18next';
import { AllMediaDevices } from '../types';
import isAudioInputDevice from '../utils/isAudioInputDevice';
import isVideoInputDevice from '../utils/isVideoInputDevice';
import renameDefaultAudioOutputDevice from '../utils/renameDefaultAudioOutputDevice';

/**
 * React hook that retrieves and maintains the available audio/video input/output devices from the user's device.
 * This hook leverages Vonage Video APIs to fetch the device information and listens for device changes to update the state accordingly.
 * @returns {object}
 * - @property {AllMediaDevices} allMediaDevices - an object containing device arrays: audioInputDevices, videoInputDevices, audioOutputDevices.
 * - @property {() => void} getAllMediaDevices - function to trigger update of device in allMediaDevices. It is to be called when user has given device permissions.
 */
const useDevices = () => {
  const { t } = useTranslation();
  const { mediaDevices } = window.navigator;

  const [allMediaDevices, setAllMediaDevices] = useState<AllMediaDevices>({
    audioInputDevices: [],
    videoInputDevices: [],
    audioOutputDevices: [],
  });

  /**
   * Updates the state with the current list of available devices on the user's device.
   * @returns {Promise<void>} - a promise that resolves when the device list was updated with the devices.
   */
  const getAllMediaDevices = useCallback(() => {
    if (!mediaDevices.enumerateDevices) {
      console.warn('enumerateDevices() not supported.');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      getDevices(async (err, devices) => {
        if (err) {
          reject(err); // NOSONAR
          return;
        }

        // Normalize device.kind to lowercase
        const normalizedDevices: MediaDeviceInfo[] = (devices || []).map((device) => ({
          ...device,
          kind: device.kind.toLowerCase() as MediaDeviceKind,
        })) as MediaDeviceInfo[];

        // Get audio input devices
        const audioInputDevices = normalizedDevices.filter(isAudioInputDevice);

        // Get video input devices
        const videoInputDevices = normalizedDevices.filter(isVideoInputDevice);

        // Get audio output devices
        let audioOutputDevices: MediaDeviceInfo[] = (await getAudioOutputDevices()).map(
          (device) =>
            ({
              ...device,
              kind: 'audiooutput' as MediaDeviceKind,
            }) as MediaDeviceInfo
        );

        // Rename the label of the default audio output to "System Default"
        audioOutputDevices = audioOutputDevices.map((device) =>
          renameDefaultAudioOutputDevice(device, t('devices.audio.defaultLabel'))
        );

        // Update the state with the new devices
        setAllMediaDevices({
          audioInputDevices,
          videoInputDevices,
          audioOutputDevices,
        });

        resolve();
      });
    });
  }, [mediaDevices.enumerateDevices, t]);

  /*
   * It is important to add a device change listener that is available by the browsers.
   * See: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/devicechange_event
   */
  useEffect(() => {
    // Add an event listener to update device list when the list changes (such as plugging or unplugging a device)
    mediaDevices.addEventListener('devicechange', getAllMediaDevices);

    // Fetch the initial list of the devices when the component mounts
    getAllMediaDevices();

    return () => {
      // Remove the event listener when component unmounts
      mediaDevices.removeEventListener('devicechange', getAllMediaDevices);
    };
  }, [getAllMediaDevices, mediaDevices]);

  return { allMediaDevices, getAllMediaDevices };
};

export default useDevices;
