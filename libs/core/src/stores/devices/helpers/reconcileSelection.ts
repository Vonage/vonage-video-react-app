import { MediaDeviceInfoJSON, DevicesAPI } from '../types';
import organizeMediaDevicesByKind from './organizeMediaDevicesByKind';
import { setAudioOutputDevice as setVonageAudioOutputDevice } from '@vonage/client-sdk-video';

/**
 * Call this function after syncing media devices info to reconcile the current selection
 * with the available media devices.
 */
const reconcileSelection = async ({ getState, setState }: DevicesAPI) => {
  const { selection, mediaDeviceInfo } = getState();

  const mediaDeviceInfoByKind = organizeMediaDevicesByKind({ mediaDeviceInfo });

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  const videoInput = (() => {
    const selected = selection.get('videoinput');
    if (selected) return selected;

    return stream.getVideoTracks()[0]?.getSettings() ?? null;
  })();

  const audioInput = (() => {
    const selected = selection.get('audioinput');
    if (selected) return selected;

    return stream.getAudioTracks()[0]?.getSettings() ?? null;
  })();

  const audioOutput = (() => {
    const selected = selection.get('audiooutput');
    if (selected) return selected;

    return mediaDeviceInfoByKind['audiooutput']?.['default'] ?? null;
  })();

  // reconcile selection mapping only what has changed
  const newSelection = new Map(
    (
      [
        ['videoinput', videoInput],
        ['audioinput', audioInput],
        ['audiooutput', audioOutput],
      ] as [MediaDeviceKind, MediaDeviceInfoJSON | null][]
    ).reduce((acc: [MediaDeviceKind, MediaDeviceInfoJSON | null][], [kind, device]) => {
      const available = mediaDeviceInfoByKind[kind] ?? {};
      const current = available[device?.deviceId ?? 'default'] ?? null;

      // no need to update selection
      if (selection.has(kind) && isSameDevice(current, device)) return acc;

      const item = (() => {
        if (current) return { ...current };
        if (available['default']) return { ...available['default'] };

        return null;
      })();

      // converts the device info proto into literal object
      acc.push([
        kind,
        {
          deviceId: item?.deviceId ?? 'default',
          kind: kind,
          label: item?.label ?? '',
          groupId: item?.groupId ?? '',
        },
      ]);

      return acc;
    }, [])
  );

  const shouldUpdateSelection = newSelection.size > 0;
  if (!shouldUpdateSelection) return;

  // concatenate new selection with the existing one
  setState((state) => ({
    ...state,
    selection: new Map([...state.selection, ...newSelection]),
  }));

  // if the audio device changed, reconcileSelection with Vonage SDK
  if (newSelection.has('audiooutput')) {
    void setVonageAudioOutputDevice(newSelection.get('audiooutput')?.deviceId || 'default');
  }
};

function isSameDevice(
  deviceA: MediaDeviceInfoJSON | null,
  deviceB: MediaDeviceInfoJSON | null
): boolean {
  if (deviceA === deviceB) return true;

  const isSameLabel = deviceA?.label === deviceB?.label;
  const isSameDeviceId = deviceA?.deviceId === deviceB?.deviceId;
  const isSameGroupId = deviceA?.groupId === deviceB?.groupId;
  const isSameKind = deviceA?.kind === deviceB?.kind;

  return isSameLabel && isSameDeviceId && isSameGroupId && isSameKind;
}

export default reconcileSelection;
