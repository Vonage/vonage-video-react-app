import { Publisher } from '@vonage/client-sdk-video';

/**
 * Returns the initial background replacement setting based on the publisher's video filter.
 * @param {Publisher} publisher - The Vonage Publisher instance.
 * @returns {string} - The initial background replacement setting.
 *   Possible values are 'none', 'low-blur', 'high-blur', or the filename of a background image.
 *   If no valid background is set, it returns 'none'.
 * @throws {Error} - Throws an error if the publisher is not provided.
 */
export default function getInitialBackgroundFilter(publisher?: Publisher | null): string {
  const filter = publisher?.getVideoFilter?.();
  if (filter?.type === 'backgroundBlur') {
    if (filter.blurStrength === 'low') {
      return 'low-blur';
    }
    if (filter.blurStrength === 'high') {
      return 'high-blur';
    }
  }
  if (filter?.type === 'backgroundReplacement') {
    return filter.backgroundImgUrl?.split('/').pop() || 'none';
  }
  return 'none';
}
