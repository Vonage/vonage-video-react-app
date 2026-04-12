import useMediaDeviceInfoByKind$ from '../useMediaDeviceInfoByKind$';
import mediaDevices from '../../devicesStore';
import { UseHookOptions } from 'react-global-state-hooks';
import { isString } from '@common/assertions';
import type { MediaDeviceInfoJSON } from '@web/types';

/**
 * Returns the selected media device for a specific kind.
 */
function useMediaDeviceInfo(kind: MediaDeviceKind, options?: Options): MediaDeviceInfoJSON | null;

/**
 * Returns media devices for a specific kind and deviceId.
 */
function useMediaDeviceInfo(
  kind: MediaDeviceKind,
  deviceId: string,
  options?: Options
): MediaDeviceInfoJSON | null;

function useMediaDeviceInfo(
  kind: MediaDeviceKind,
  arg1?: string | Options,
  arg2?: Options
): MediaDeviceInfoJSON | null {
  const deviceId = isString(arg1) ? arg1 : undefined;
  const options = isString(arg1) ? arg2 : arg1;

  return useMediaDeviceInfoByKind$(
    (state) => {
      return getDeviceInfo(kind, deviceId, state);
    },
    {
      dependencies: [kind, deviceId],
      isEqualRoot: (prev, next) => {
        const deviceA = getDeviceInfo(kind, deviceId, prev);
        const deviceB = getDeviceInfo(kind, deviceId, next);

        return options?.isEqual?.(deviceA, deviceB) ?? Object.is(deviceA, deviceB);
      },
    }
  );
}

function getDeviceInfo(
  kind: MediaDeviceKind,
  deviceId: string | undefined,
  state: Record<MediaDeviceKind, Record<string, MediaDeviceInfoJSON>>
): MediaDeviceInfoJSON | null {
  if (deviceId) {
    return state[kind][deviceId] ?? null;
  }

  const selected = mediaDevices.getState()[kind];
  return state[kind][selected!] ?? null;
}

type Options = Omit<
  UseHookOptions<MediaDeviceInfoJSON | null, MediaDeviceInfoJSON>,
  'isEqualRoot' | 'dependencies'
>;

export default useMediaDeviceInfo;
