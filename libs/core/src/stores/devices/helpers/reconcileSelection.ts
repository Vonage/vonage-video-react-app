import { MediaDeviceInfoJSON, DevicesAPI } from '../types';
import getMediaDeviceInfoByKind from './getMediaDeviceInfoByKind';

const reconcileSelection = ({ getState, setState }: DevicesAPI) => {
  const { selection, mediaDeviceInfo } = getState();

  const mediaDeviceInfoByKind = getMediaDeviceInfoByKind({ mediaDeviceInfo });

  // reconcile selection mapping only what has changed
  const newSelection = new Map(
    Array.from(selection.entries()).reduce(
      (acc, [kind, device]) => {
        const available = mediaDeviceInfoByKind[kind] ?? {};
        const current = available[device?.deviceId ?? ''];

        // no need to update selection
        if (isSameDevice(current, device)) return acc;

        acc.push([kind, current ?? available['default'] ?? null]);
        return acc;
      },
      [] as [MediaDeviceKind, MediaDeviceInfoJSON | null][]
    )
  );

  const shouldUpdateSelection = newSelection.size > 0;
  if (!shouldUpdateSelection) return;

  // concatenate new selection with the existing one
  setState((state) => ({
    ...state,
    selection: new Map([...state.selection, ...newSelection]),
  }));
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
