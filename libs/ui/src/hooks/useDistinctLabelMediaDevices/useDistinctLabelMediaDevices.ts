import useMediaDeviceInfoByKind$ from '@core/stores/devices/hooks/useMediaDeviceInfoByKind$';
import type { MediaDeviceInfoJSON } from '@web/types';
import { cleanAndDedupeDeviceLabels } from './helpers';
import { mediaDevicesMap$ } from '@core/stores/devices/observables';
import type { Any, UseHookOptions } from 'react-global-state-hooks';

/**
 * Returns media devices for a specific kind with cleaned, distinct labels.
 *
 * Removes technical identifiers (USB paths, hardware IDs) and ensures label uniqueness
 * by adding numeric suffixes to duplicates (e.g., "Logitech Webcam (2)").
 *
 * @param kind - The type of media device ('audioinput', 'videoinput', 'audiooutput').
 * @returns Array of media devices for the specified kind with cleaned labels.
 */
function useDistinctLabelMediaDevices(kind: MediaDeviceKind): MediaDeviceInfoJSON[];

/**
 * Returns a selected subset of devices for a specific kind with cleaned, distinct labels.
 *
 * Removes technical identifiers (USB paths, hardware IDs) and ensures label uniqueness
 * by adding numeric suffixes to duplicates (e.g., "Logitech Webcam (2)").
 *
 * @param kind - The type of media device ('audioinput', 'videoinput', 'audiooutput').
 * @param selector - Function to select and transform the devices of the specified kind.
 * @param options - Hook options including equality checks and dependencies for memoization.
 * @returns The selected value from the devices state for the specified kind.
 */
function useDistinctLabelMediaDevices<Selection>(
  kind: MediaDeviceKind,
  selector: (state: MediaDeviceInfoJSON[]) => Selection,
  options?: Options<Selection>
): Selection;

/**
 * Returns a selected subset of devices for a specific kind with cleaned, distinct labels.
 *
 * Removes technical identifiers (USB paths, hardware IDs) and ensures label uniqueness
 * by adding numeric suffixes to duplicates (e.g., "Logitech Webcam (2)").
 *
 * @param kind - The type of media device ('audioinput', 'videoinput', 'audiooutput').
 * @param selector - Function to select and transform the devices of the specified kind.
 * @param dependencies - Dependency array for memoization.
 * @returns The selected value from the devices state for the specified kind.
 */
function useDistinctLabelMediaDevices<Selection>(
  kind: MediaDeviceKind,
  selector: (state: MediaDeviceInfoJSON[]) => Selection,
  dependencies?: Dependencies
): Selection;

function useDistinctLabelMediaDevices<Selection = MediaDeviceInfoJSON[]>(
  kind: MediaDeviceKind,
  selector: Selector = (devices): MediaDeviceInfoJSON[] => devices,
  args?: Options<unknown> | Dependencies
): Selection {
  const dependencies = Array.isArray(args) ? args : [];
  const options = Array.isArray(args) ? { dependencies } : (args ?? {});

  return useMediaDeviceInfoByKind$(
    (state) => selector(cleanAndDedupeDeviceLabels(Object.values(state[kind]))),
    {
      ...options,
      dependencies: [kind, ...(options.dependencies ?? [])],
      isEqualRoot: (prev, next) => {
        if (options.isEqualRoot) return options.isEqualRoot(prev, next);

        return prev[kind] === next[kind];
      },
    }
  ) as Selection;
}

type Selector = (devices: MediaDeviceInfoJSON[]) => Any;

type DevicesInfoByKind = ReturnType<(typeof mediaDevicesMap$)['getState']>;

type Options<Selection> = UseHookOptions<Selection, DevicesInfoByKind> & {
  name?: string;
};

type Dependencies = unknown[];

export default useDistinctLabelMediaDevices;
