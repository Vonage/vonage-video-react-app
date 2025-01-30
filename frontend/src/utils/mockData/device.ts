import { AudioOutputDevice, Device } from '@vonage/client-sdk-video';
import { AllMediaDevices } from '../../types';

/**
 * Default mocked audio input device.
 * @property {string} deviceId - The unique identifier for the audio device.
 * @property {string} label - the user-friendly name for the audio device.
 * @property {string} kind - the type of media device.
 */
export const defaultAudioDevice = {
  deviceId: 'default',
  label: 'Default - Soundcore Life A2 NC (Bluetooth)',
  kind: 'audioInput',
};

export const audioInputDevices: Device[] = [
  {
    deviceId: 'default',
    label: 'Default - Soundcore Life A2 NC (Bluetooth)',
    kind: 'audioInput',
  },
  {
    deviceId: 'd59e9898546591e31374d2eb459566649abe47fd461625da72d0cf75f43dc36f',
    label: 'Soundcore Life A2 NC (Bluetooth)',
    kind: 'audioInput',
  },
  {
    deviceId: '68f1d1e6f11c629b1febe51a95f8f740f8ac5cd3d4c91419bd2b52bb1a9a01cd',
    label: 'MacBook Pro Microphone (Built-in)',
    kind: 'audioInput',
  },
];

export const videoInputDevices: Device[] = [
  {
    deviceId: 'a68ec4e4a6bc10dc572bd806414b0da27d0aefb0ad822f7ba4cf9b226bb9b7c2',
    label: 'FaceTime HD Camera (2C0E:82E3)',
    kind: 'videoInput',
  },
];

export const audioOutputDevices: AudioOutputDevice[] = [
  {
    deviceId: 'default',
    label: 'System Default',
  },
  {
    deviceId: '9a2f0c5c9cf94d8bc34847f13ce863864d18ab9f969a73ffa9d15c8162829d68',
    label: 'Soundcore Life A2 NC (Bluetooth)',
  },
  {
    deviceId: '86e5a9ea93853f6cf7a39c93a0eb979ea9f9e5c97767268629a9ceafd668cdb7',
    label: 'MacBook Pro Speakers (Built-in)',
  },
];

export const nativeDevices = [...audioInputDevices, ...videoInputDevices, ...audioOutputDevices];
/**
 * Default mocked video input device.
 * @property {string} deviceId - The unique identifier for the audio device.
 * @property {string} kind - the type of media device.
 */
export const defaultVideoDevice = {
  deviceId: 'default-video-device-id',
  kind: 'videoInput',
};

/**
 * An object containing all available media devices.
 * @property {Array<object>} audioInputDevices - all available audio input devices.
 * @property {Array<object>} videoInputDevices - all available video input devices.
 * @property {Array<object>} audioOutputDevices - all available audio output devices.
 */
export const allMediaDevices: AllMediaDevices = {
  audioInputDevices,
  videoInputDevices,
  audioOutputDevices,
};

export default allMediaDevices;
