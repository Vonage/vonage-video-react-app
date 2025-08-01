import { Publisher } from '@vonage/client-sdk-video';

/**
 * Returns the initial background replacement setting based on the publisher's video filter.
 * @param {Publisher} publisher - The Vonage Publisher instance.
 * @returns {string} - The initial background replacement setting.
 *   Possible values are 'none', 'low-blur', 'high-blur', or the filename of a background image.
 *   If no valid background is set, it returns 'none'.
 * @throws {Error} - Throws an error if the publisher is not provided.
 */
export default function getInitialBackgroundReplacement(publisher?: Publisher | null): string {
  if (!publisher) {
    throw new Error('Publisher is not provided');
  }
  const videoFilter = publisher.getVideoFilter();
  if (videoFilter && videoFilter.type === 'backgroundBlur' && videoFilter.blurStrength === 'low') {
    return 'low-blur';
  }
  if (videoFilter && videoFilter.type === 'backgroundBlur' && videoFilter.blurStrength === 'high') {
    return 'high-blur';
  }
  if (videoFilter && videoFilter.type === 'backgroundReplacement') {
    return videoFilter.backgroundImgUrl?.split('/').pop() || 'none';
  }
  return 'none';
}
