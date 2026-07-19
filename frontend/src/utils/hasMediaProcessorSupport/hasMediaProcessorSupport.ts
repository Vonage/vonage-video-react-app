import { hasMediaProcessorSupport as vonageHasMediaProcessorSupport } from '@vonage/client-sdk-video';

type MediaProcessorMediaType = NonNullable<Parameters<typeof vonageHasMediaProcessorSupport>[0]>;

const supportCache = new Map<MediaProcessorMediaType, boolean>();

/**
 * Memoized wrapper around the Vonage SDK's `hasMediaProcessorSupport`.
 *
 * Media-processor support depends only on the browser, so the result is constant for the life of
 * the page. The SDK's synchronous check is deprecated and logs a deprecation warning on *every*
 * call (and on Safari rebuilds an OffscreenCanvas/WebGPU context each time). Several components call
 * it straight from their render body, so on a busy call it re-runs on every re-render — flooding the
 * console and repeating real work. Caching the first result per media type keeps it to a single
 * underlying call, which removes both the warning spam and the wasted work.
 */
const hasMediaProcessorSupport = (mediaType: MediaProcessorMediaType = 'both'): boolean => {
  const cached = supportCache.get(mediaType);
  if (cached !== undefined) {
    return cached;
  }

  const isSupported = vonageHasMediaProcessorSupport(mediaType);
  supportCache.set(mediaType, isSupported);
  return isSupported;
};

/**
 * Clears the memoized results. Tests that stub the underlying SDK check with different values across
 * cases call this between cases so a stale cached result isn't observed; production never needs it.
 */
export const resetMediaProcessorSupportCache = (): void => {
  supportCache.clear();
};

export default hasMediaProcessorSupport;
