import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';

type MediaType = 'audio' | 'video' | 'both';

type HasMediaProcessorSupport = ((mediaType?: MediaType) => boolean) & {
  promise?: (mediaType?: MediaType) => Promise<boolean>;
};

const getCheck = (): HasMediaProcessorSupport =>
  hasMediaProcessorSupport as HasMediaProcessorSupport;

const isVitestMock = (value: unknown): boolean =>
  typeof value === 'function' && '_isMockFunction' in value;

/**
 * Sync video-filter capability check. Prefer {@link hasVideoMediaProcessorSupportAsync}
 * when an await is possible — SDK 2.35+ `promise()` is the thorough Safari/WebGPU path.
 */
export const hasVideoMediaProcessorSupport = (): boolean => getCheck()('video');

/**
 * Video-filter capability using `OT.hasMediaProcessorSupport.promise('video')` when
 * the SDK exposes it (2.35+), otherwise the sync `'video'` check.
 *
 * Vitest's automock of the 2.35 SDK copies the real `.promise` onto the mock
 * function. That unmocked promise ignores `mockReturnValue` and returns false
 * in jsdom — so if the export is a mock and `.promise` is not, use the sync mock.
 */
export const hasVideoMediaProcessorSupportAsync = (): Promise<boolean> => {
  const check = getCheck();

  if (typeof check.promise !== 'function') {
    return Promise.resolve(check('video'));
  }

  if (isVitestMock(check) && !isVitestMock(check.promise)) {
    return Promise.resolve(check('video'));
  }

  return check.promise('video');
};
