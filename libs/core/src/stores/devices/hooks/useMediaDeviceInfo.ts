import type { Any, UseHookOptions } from 'react-global-state-hooks';
import useMediaDeviceInfoByKind$ from './useMediaDeviceInfoByKind$';

/**
 * Returns the selected media device for a specific kind.
 */
function useMediaDeviceInfo(kind: MediaDeviceKind): MediaDeviceInfo | null;

/**
 * Returns media devices for a specific kind organized by deviceId.
 */
function useMediaDeviceInfo<Selection>(
  kind: MediaDeviceKind,
  selector: (state: MediaDeviceInfo | null) => Selection,
  options?: Options<Selection>
): Selection;

/**
 * Returns media devices for a specific kind organized by deviceId.
 */
function useMediaDeviceInfo<Selection>(
  kind: MediaDeviceKind,
  selector: (state: MediaDeviceInfo | null) => Selection,
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

  return useMediaDeviceInfoByKind$((state) => selector?.(state[kind]) ?? state[kind], {
    ...options,
    dependencies: [kind, ...(options.dependencies ?? [])],
  }) as Record<string, MediaDeviceInfo> | Record<MediaDeviceKind, Record<string, MediaDeviceInfo>>;
}

type Selector = (state: Any) => Any;

type DevicesInfoByKind = ReturnType<(typeof useMediaDeviceInfoByKind$)['getState']>;

type Options<Selection> = UseHookOptions<Selection, DevicesInfoByKind> & {
  name?: string;
};

type Dependencies = unknown[];

export default useMediaDeviceInfo;
