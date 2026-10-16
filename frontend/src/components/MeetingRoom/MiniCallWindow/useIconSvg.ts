import { useSyncExternalStore } from 'react';
import tryCatch from '@common/execution/tryCatch';

/**
 * Base URL for Vonage Vivid icon SVG files (v4.11.0).
 */
const VIVID_ICON_BASE_URL = 'https://icon.resources.vonage.com/v4.11.0';

/**
 * Icons that are rendered inside the Mini Mode Picture-in-Picture window.
 * Pre-loaded at module initialization so they are available on first render.
 */
const PRELOADED_ICONS = [
  'microphone-solid',
  'mic-mute-solid',
  'video-solid',
  'video-off-solid',
  'export-solid',
  'end-call-solid',
];

const iconSvgCache = new Map<string, string>();
const iconCacheListeners = new Set<() => void>();
const pendingFetches = new Map<string, Promise<void>>();
let cacheGeneration = 0;

/**
 * Normalizes the width/height attributes of a raw SVG string so the icon
 * fills its container uniformly regardless of the source's intrinsic size.
 */
function normalizeSvgDimensions(rawSvg: string): string {
  return rawSvg
    .replace(/\swidth="[^"]*"/, ' width="100%"')
    .replace(/\sheight="[^"]*"/, ' height="100%"');
}

/**
 * Fetches a Vivid icon SVG, normalizes its dimensions, caches it, and
 * notifies subscribers so they can re-render.
 * @param name - Vivid icon name without the `.svg` extension
 * @returns A promise that resolves when the SVG is cached
 */
const loadIconSvg = (name: string): Promise<void> => {
  if (iconSvgCache.has(name)) {
    return Promise.resolve();
  }

  const existing = pendingFetches.get(name);
  if (existing) {
    return existing;
  }

  const myGeneration = cacheGeneration;

  const promise = (async () => {
    const { result: response, error: fetchError } = await tryCatch(() =>
      fetch(`${VIVID_ICON_BASE_URL}/${name}.svg`)
    );

    if (fetchError || !response) {
      if (cacheGeneration === myGeneration) {
        iconSvgCache.set(name, '');
        iconCacheListeners.forEach((listener) => listener());
      }
      return;
    }

    if (!response.ok) {
      if (cacheGeneration === myGeneration) {
        iconSvgCache.set(name, '');
        iconCacheListeners.forEach((listener) => listener());
      }
      return;
    }

    const { result: rawSvg, error: textError } = await tryCatch(() => response.text());

    if (textError || !rawSvg) {
      if (cacheGeneration === myGeneration) {
        iconSvgCache.set(name, '');
        iconCacheListeners.forEach((listener) => listener());
      }
      return;
    }

    if (cacheGeneration === myGeneration) {
      iconSvgCache.set(name, normalizeSvgDimensions(rawSvg));
      iconCacheListeners.forEach((listener) => listener());
    }
  })();

  pendingFetches.set(name, promise);
  return promise;
};

// Pre-fetch all icons used in the mini mode UI at module load time.
// This ensures they are cached before the PiP window opens.
for (const name of PRELOADED_ICONS) {
  void loadIconSvg(name);
}

const subscribeToCache = (callback: () => void): (() => void) => {
  iconCacheListeners.add(callback);
  return () => {
    iconCacheListeners.delete(callback);
  };
};

const getSvgSnapshot = (name: string): string => iconSvgCache.get(name) ?? '';

/**
 * Returns the cached SVG string for a Vivid icon name.
 * Subscribes to cache updates via useSyncExternalStore so components
 * re-render when a previously-uncached icon finishes loading.
 * @param name - Vivid icon name without the `.svg` extension
 * @returns The normalized SVG markup (empty string if not yet loaded)
 */
const useIconSvg = (name: string): string =>
  useSyncExternalStore(
    subscribeToCache,
    () => getSvgSnapshot(name),
    () => getSvgSnapshot(name)
  );

/**
 * Clears the icon cache and cancels pending fetches. Intended for test isolation.
 */
const resetIconCache = (): void => {
  cacheGeneration++;
  iconSvgCache.clear();
  pendingFetches.clear();
  iconCacheListeners.clear();
};

export { loadIconSvg, resetIconCache };
export default useIconSvg;
