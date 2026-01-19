import type { Any, UseHookOptions } from 'react-global-state-hooks';
import mediaDevicesMap$ from '../observables/mediaDevicesMap$';
import { isFunction, isString } from '@common/assertions';
import useMediaDeviceInfoByKind$ from './useMediaDeviceInfoByKind$';
import type { MediaDeviceInfoJSON } from '@web/types';

/**
 * Returns media devices organized by kind and deviceId.
 */
function useMediaDevices(): DevicesInfoByKind;

/**
 * Returns media devices for a specific kind organized by deviceId.
 */
function useMediaDevices(kind: MediaDeviceKind): Record<string, MediaDeviceInfoJSON>;

/**
 * Returns media devices organized by kind and deviceId.
 */
function useMediaDevices<Selection>(
  selector: (state: DevicesInfoByKind) => Selection,
  dependencies?: Dependencies
): Selection;

/**
 * Returns media devices organized by kind and deviceId.
 */
function useMediaDevices<Selection>(
  selector: (state: DevicesInfoByKind) => Selection,
  options?: Options<Selection>
): Selection;

/**
 * Returns media devices for a specific kind organized by deviceId.
 */
function useMediaDevices<Selection>(
  kind: MediaDeviceKind,
  selector: (state: Record<string, MediaDeviceInfo>) => Selection,
  options?: Options<Selection>
): Selection;

/**
 * Returns media devices for a specific kind organized by deviceId.
 */
function useMediaDevices<Selection>(
  kind: MediaDeviceKind,
  selector: (state: Record<string, MediaDeviceInfo>) => Selection,
  dependencies?: Dependencies
): Selection;

function useMediaDevices(
  ...args: [
    arg1?: MediaDeviceKind | Selector | undefined,
    arg2?: Selector | Options<unknown> | Dependencies | undefined,
    arg3?: Options<unknown> | Dependencies | undefined,
  ]
):
  | Record<string, MediaDeviceInfoJSON>
  | Record<MediaDeviceKind, Record<string, MediaDeviceInfoJSON>> {
  const [arg1, arg2, arg3] = args;

  const kind = isString(arg1) ? arg1 : undefined;

  const selector = ((): Selector => {
    if (isFunction(arg1)) return arg1;
    if (isFunction(arg2)) return arg2;

    return (state: unknown) => state;
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
    isEqualRoot: (prev, next) => {
      if (options.isEqualRoot) return options.isEqualRoot(prev, next);
      if (kind) return prev[kind] === next[kind];

      return prev === next;
    },
  }) as
    | Record<string, MediaDeviceInfoJSON>
    | Record<MediaDeviceKind, Record<string, MediaDeviceInfoJSON>>;
}

type Selector = (state: Any) => Any;

type DevicesInfoByKind = ReturnType<(typeof mediaDevicesMap$)['getState']>;

type Options<Selection> = UseHookOptions<Selection, DevicesInfoByKind> & {
  name?: string;
};

type Dependencies = unknown[];

export default useMediaDevices;
