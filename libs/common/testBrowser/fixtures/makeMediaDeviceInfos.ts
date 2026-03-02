/**
 * Some media device info fixtures for testing purposes.
 * Do not add logic here.
 */
const makeMediaDeviceInfos = () =>
  [
    {
      deviceId: 'audio-input-1',
      kind: 'audioinput',
      label: 'Default Microphone',
      groupId: 'group-1',
      toJSON: () => ({
        deviceId: 'audio-input-1',
        kind: 'audioinput' as MediaDeviceKind,
        label: 'Default Microphone',
        groupId: 'group-1',
      }),
    },
    {
      deviceId: 'audio-input-2',
      kind: 'audioinput',
      label: 'USB Headset Microphone',
      groupId: 'group-4',
      toJSON: () => ({
        deviceId: 'audio-input-2',
        kind: 'audioinput' as MediaDeviceKind,
        label: 'USB Headset Microphone',
        groupId: 'group-4',
      }),
    },
    {
      deviceId: 'audio-input-3',
      kind: 'audioinput',
      label: 'External Microphone',
      groupId: 'group-5',
      toJSON: () => ({
        deviceId: 'audio-input-3',
        kind: 'audioinput' as MediaDeviceKind,
        label: 'External Microphone',
        groupId: 'group-5',
      }),
    },
    {
      deviceId: 'video-input-1',
      kind: 'videoinput',
      label: 'Default Camera',
      groupId: 'group-2',
      toJSON: () => ({
        deviceId: 'video-input-1',
        kind: 'videoinput' as MediaDeviceKind,
        label: 'Default Camera',
        groupId: 'group-2',
      }),
    },
    {
      deviceId: 'video-input-2',
      kind: 'videoinput',
      label: 'USB Webcam',
      groupId: 'group-6',
      toJSON: () => ({
        deviceId: 'video-input-2',
        kind: 'videoinput' as MediaDeviceKind,
        label: 'USB Webcam',
        groupId: 'group-6',
      }),
    },
    {
      deviceId: 'video-input-3',
      kind: 'videoinput',
      label: 'HD External Camera',
      groupId: 'group-7',
      toJSON: () => ({
        deviceId: 'video-input-3',
        kind: 'videoinput' as MediaDeviceKind,
        label: 'HD External Camera',
        groupId: 'group-7',
      }),
    },
    {
      deviceId: 'audio-output-1',
      kind: 'audiooutput',
      label: 'Default Speakers',
      groupId: 'group-3',
      toJSON: () => ({
        deviceId: 'audio-output-1',
        kind: 'audiooutput' as MediaDeviceKind,
        label: 'Default Speakers',
        groupId: 'group-3',
      }),
    },
    {
      deviceId: 'audio-output-2',
      kind: 'audiooutput',
      label: 'USB Headset Speakers',
      groupId: 'group-8',
      toJSON: () => ({
        deviceId: 'audio-output-2',
        kind: 'audiooutput' as MediaDeviceKind,
        label: 'USB Headset Speakers',
        groupId: 'group-8',
      }),
    },
    {
      deviceId: 'audio-output-3',
      kind: 'audiooutput',
      label: 'Bluetooth Speakers',
      groupId: 'group-9',
      toJSON: () => ({
        deviceId: 'audio-output-3',
        kind: 'audiooutput' as MediaDeviceKind,
        label: 'Bluetooth Speakers',
        groupId: 'group-9',
      }),
    },
  ] as MediaDeviceInfo[];

export default makeMediaDeviceInfos;
