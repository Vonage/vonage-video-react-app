import type { Any, UseHookOptions } from 'react-global-state-hooks';
import mediaDeviceInfoByKind$ from '../observables/mediaDeviceInfoByKind$';
import { isFunction, isString } from '@common/assertions';
import useMediaDeviceInfoByKind$ from './useMediaDeviceInfoByKind$';

/**
 * Returns media devices organized by kind and deviceId.
 */
function useMediaDevicesInfoByKind<Selection>(
  selector?: (state: DevicesInfoByKind) => Selection,
  dependencies?: Dependencies
): Record<MediaDeviceKind, Record<string, MediaDeviceInfo>>;

/**
 * Returns media devices organized by kind and deviceId.
 */
function useMediaDevicesInfoByKind<Selection>(
  selector?: (state: DevicesInfoByKind) => Selection,
  options?: Options<Selection>
): Record<MediaDeviceKind, Record<string, MediaDeviceInfo>>;

/**
 * Returns media devices for a specific kind organized by deviceId.
 */
function useMediaDevicesInfoByKind<Selection>(
  kind: MediaDeviceKind,
  selector?: (state: DevicesInfoByKind) => Selection,
  options?: Options<Selection>
): Record<string, MediaDeviceInfo>;

/**
 * Returns media devices for a specific kind organized by deviceId.
 */
function useMediaDevicesInfoByKind<Selection>(
  kind: MediaDeviceKind,
  selector?: (state: DevicesInfoByKind) => Selection,
  dependencies?: Dependencies
): Record<string, MediaDeviceInfo>;

function useMediaDevicesInfoByKind(
  ...args: [
    arg1: MediaDeviceKind | Selector | undefined,
    arg2?: Selector | Options<unknown> | Dependencies | undefined,
    arg3?: Options<unknown> | Dependencies | undefined,
  ]
): Record<string, MediaDeviceInfo> | Record<MediaDeviceKind, Record<string, MediaDeviceInfo>> {
  const [arg1, arg2, arg3] = args;

  const kind = isString(arg1) ? arg1 : undefined;

  const selector = ((): Selector => {
    if (isFunction(arg1)) return arg1;
    if (isFunction(arg2)) return arg2;

    return (state: DevicesInfoByKind) => state;
  })();

  const dependencies = (() => {
    if (Array.isArray(arg2)) return arg2;
    if (Array.isArray(arg3)) return arg3;

    return [];
  })();

  const options = (() => {
    if (arg2 && !isFunction(arg2) && !Array.isArray(arg2)) return arg2;
    if (arg3 && !isFunction(arg3) && !Array.isArray(arg3)) return arg3;

    return { dependencies };
  })();

  return useMediaDeviceInfoByKind$((state) => selector(kind ? state[kind] : state), {
    ...options,
    dependencies: [kind, ...(options.dependencies ?? [])],
  }) as Record<string, MediaDeviceInfo> | Record<MediaDeviceKind, Record<string, MediaDeviceInfo>>;
}

type Selector = (state: Any) => Any;

type DevicesInfoByKind = ReturnType<(typeof mediaDeviceInfoByKind$)['getState']>;

type Options<Selection> = UseHookOptions<Selection, DevicesInfoByKind> & {
  name?: string;
};

type Dependencies = unknown[];

export default useMediaDevicesInfoByKind;
