import useMediaDeviceInfoByKind$ from '@core/stores/devices/hooks/useMediaDeviceInfoByKind$';
import type { MediaDeviceInfoJSON } from '@web/types';
import { cleanAndDedupeDeviceLabels } from './helpers';
import { mediaDevicesMap$ } from '@core/stores/devices/observables';
import type { Any, UseHookOptions } from 'react-global-state-hooks';
import mergeDefaultDeviceLabel from '@web/helpers/mergeDefaultDeviceLabel';
import type { MergeDefaultDeviceLabelResult } from '@web/helpers/mergeDefaultDeviceLabel';
import translateMediaDeviceLabel from '@web/helpers/translateMediaDeviceLabel';

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
 * Returns media devices with the browser's virtual "default" entry merged into the
 * matching real device, appending systemDefaultLabel as a suffix (e.g. "- System Default").
 *
 * @param kind - The type of media device ('audioinput', 'videoinput', 'audiooutput').
 * @param selector - Optional function to transform devices before the merge (e.g. label fallbacks).
 * @param options - Must include systemDefaultLabel; the translated label for the system default device.
 * @returns An object with the merged devices array and the systemDefaultDeviceId.
 */
function useDistinctLabelMediaDevices(
  kind: MediaDeviceKind,
  selector: ((state: MediaDeviceInfoJSON[]) => MediaDeviceInfoJSON[]) | undefined,
  options: Options<unknown> & { systemDefaultLabel: string; translate?: (key: string) => string }
): MergeDefaultDeviceLabelResult;

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
  selector?: Selector,
  args?: Options<unknown> | Dependencies
): Selection {
  const effectiveSelector: Selector = selector ?? ((devices): MediaDeviceInfoJSON[] => devices);
  const dependencies = Array.isArray(args) ? args : [];
  const { systemDefaultLabel, translate, ...options } = Array.isArray(args)
    ? ({ dependencies } as Options<unknown> & {
        systemDefaultLabel?: string;
        translate?: (key: string) => string;
      })
    : ((args ?? {}) as Options<unknown> & {
        systemDefaultLabel?: string;
        translate?: (key: string) => string;
      });

  return useMediaDeviceInfoByKind$(
    (state) => {
      const cleaned = cleanAndDedupeDeviceLabels(Object.values(state[kind]));
      const selected = effectiveSelector(cleaned);
      if (systemDefaultLabel !== undefined) {
        const merged = mergeDefaultDeviceLabel({
          devices: selected as MediaDeviceInfoJSON[],
          systemDefaultLabel,
        });
        if (!translate) return merged;
        return {
          ...merged,
          devices: merged.devices.map((d) => ({
            ...d,
            label: d.label ? translateMediaDeviceLabel({ label: d.label, translate }) : d.label,
          })),
        };
      }
      return selected;
    },
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
