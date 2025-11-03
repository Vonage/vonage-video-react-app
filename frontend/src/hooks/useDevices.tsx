import { useState, useEffect, useCallback } from 'react';
import {
  getDevices,
  getAudioOutputDevices,
  Device,
  OTError,
  AudioOutputDevice,
} from '@vonage/client-sdk-video';
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
    // eslint-disable-next-line consistent-return
    return new Promise<void>((_resolve, reject) => {
      // Vonage Video API's getDevices retrieves all audio and video input devices
      getDevices(async (err?: OTError, devices?: Device[]) => {
        if (err) {
          // We ignore the following lint warning because we are rejecting with an OTError object.
          reject(err); // NOSONAR
        }

        // Vonage Video API's getAudioOutputDevices retrieves all audio output devices (speakers)
        let audioOutputDevices: AudioOutputDevice[] = await getAudioOutputDevices();
        // Rename the label of the default audio output to "System Default"
        audioOutputDevices = audioOutputDevices.map((device) =>
          renameDefaultAudioOutputDevice(device, t('devices.audio.defaultLabel'))
        );

        // Filter audio input devices from the list retrieved by Vonage Video API's getDevices
        const audioInputDevices = devices?.filter(isAudioInputDevice) || [];

        // Filter video input devices from the list retrieved by Vonage Video API's getDevices
        const videoInputDevices = devices?.filter(isVideoInputDevice) || [];

        // Update the state with the new devices
        setAllMediaDevices({
          audioInputDevices,
          videoInputDevices,
          audioOutputDevices,
        });
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
