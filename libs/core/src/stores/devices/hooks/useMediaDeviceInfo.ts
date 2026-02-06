import type { Any, UseHookOptions } from 'react-global-state-hooks';
import type { MediaDeviceInfoJSON } from '@common/types';
import useMediaDeviceInfoByKind$ from './useMediaDeviceInfoByKind$';

/**
 * Returns the selected media device for a specific kind.
 */
function useMediaDeviceInfo(kind: MediaDeviceKind): MediaDeviceInfoJSON | null;

/**
 * Returns media devices for a specific kind organized by deviceId.
 */
function useMediaDeviceInfo<Selection>(
  kind: MediaDeviceKind,
  selector: (state: MediaDeviceInfoJSON | null) => Selection,
  options?: Options<Selection>
): Selection;

/**
 * Returns media devices for a specific kind organized by deviceId.
 */
function useMediaDeviceInfo<Selection>(
  kind: MediaDeviceKind,
  selector: (state: MediaDeviceInfoJSON | null) => Selection,
  dependencies?: Dependencies
): Selection;

function useMediaDeviceInfo(
  ...args: [
    arg1: MediaDeviceKind,
    arg2?: Selector | undefined,
    arg3?: Options<unknown> | Dependencies | undefined,
  ]
): Any {
  const [kind, selector, arg3] = args;

  const dependencies = Array.isArray(arg3) ? arg3 : [];

  const options =
    !arg3 || Array.isArray(arg3)
      ? {
          dependencies,
        }
      : arg3;

  return useMediaDeviceInfoByKind$(
    (state) => {
      return selector?.(state[kind]) ?? state[kind];
    },
    {
      ...options,
      dependencies: [kind, ...(options.dependencies ?? [])],
    }
  ) as
    | Record<string, MediaDeviceInfoJSON>
    | Record<MediaDeviceKind, Record<string, MediaDeviceInfoJSON>>;
}

type Selector = (state: Any) => Any;

type DevicesInfoByKind = ReturnType<(typeof useMediaDeviceInfoByKind$)['getState']>;

type Options<Selection> = UseHookOptions<Selection, DevicesInfoByKind> & {
  name?: string;
};

type Dependencies = unknown[];

export default useMediaDeviceInfo;
