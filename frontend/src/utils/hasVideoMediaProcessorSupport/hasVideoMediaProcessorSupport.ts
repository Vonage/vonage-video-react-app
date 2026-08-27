import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';

type MediaType = 'audio' | 'video' | 'both';

type HasMediaProcessorSupport = ((mediaType?: MediaType) => boolean) & {
  promise?: (mediaType?: MediaType) => Promise<boolean>;
};

const getCheck = (): HasMediaProcessorSupport =>
  hasMediaProcessorSupport as HasMediaProcessorSupport;

/**
 * Sync video-filter capability check. Prefer {@link hasVideoMediaProcessorSupportAsync}
 * when an await is possible — SDK 2.35+ `promise()` is the thorough Safari/WebGPU path.
 */
export const hasVideoMediaProcessorSupport = (): boolean => getCheck()('video');

/**
 * Video-filter capability using `OT.hasMediaProcessorSupport.promise('video')` when
 * the SDK exposes it (2.35+), otherwise the sync `'video'` check.
 */
export const hasVideoMediaProcessorSupportAsync = (): Promise<boolean> => {
  const check = getCheck();

  return typeof check.promise === 'function'
    ? check.promise('video')
    : Promise.resolve(check('video'));
};
