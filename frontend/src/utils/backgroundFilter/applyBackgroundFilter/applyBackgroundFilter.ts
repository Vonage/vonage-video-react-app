import { hasMediaProcessorSupport, Publisher, VideoFilter } from '@vonage/client-sdk-video';
import { UserType } from '../../../Context/user';
import { BACKGROUNDS_PATH } from '../../constants';
import { setStorageItem, STORAGE_KEYS } from '../../storage';

/**
 * Applies a background filter to the publisher.
 * @param {Publisher} publisher - The Vonage Publisher instance.
 * @param {string} backgroundSelected - The selected background option.
 * @param {Function} [setUser] - Optional function to update user state.
 * @param {Function} [setBackgroundFilter] - Optional function to set background filter state.
 * @param {boolean} [storeItem] - Optional flag to determine if the filter should be stored.
 * @returns {Promise<void>} - A promise that resolves when the filter is applied or cleared.
 * @throws {Error} - Throws an error if the publisher is not provided or if the backgroundSelected is invalid.
 */
export default async function applyBackgroundFilter(
  publisher: Publisher | null | undefined,
  backgroundSelected: string,
  setUser?: (fn: (prev: UserType) => UserType) => void,
  setBackgroundFilter?: (filter: VideoFilter | undefined) => void,
  storeItem: boolean = true
): Promise<void> {
  if (!publisher) {
    return;
  }
  if (!hasMediaProcessorSupport()) {
    console.error('Media Processor is not supported in this environment.');
    return;
  }

  let videoFilter: VideoFilter | undefined;
  if (backgroundSelected === 'low-blur' || backgroundSelected === 'high-blur') {
    videoFilter = {
      type: 'backgroundBlur',
      blurStrength: backgroundSelected === 'low-blur' ? 'low' : 'high',
    };
    await publisher.applyVideoFilter(videoFilter);
  } else if (/\.(jpg|jpeg|png|gif|bmp)$/i.test(backgroundSelected)) {
    videoFilter = {
      type: 'backgroundReplacement',
      backgroundImgUrl: `${BACKGROUNDS_PATH}/${backgroundSelected}`,
    };
    await publisher.applyVideoFilter(videoFilter);
  } else {
    await publisher.clearVideoFilter();
    videoFilter = undefined;
  }

  if (storeItem) {
    setStorageItem(STORAGE_KEYS.BACKGROUND_REPLACEMENT, JSON.stringify(videoFilter ?? ''));
  }
  if (setBackgroundFilter) {
    setBackgroundFilter(videoFilter);
  }
  if (setUser) {
    setUser((prevUser: UserType) => ({
      ...prevUser,
      defaultSettings: {
        ...prevUser.defaultSettings,
        backgroundFilter: videoFilter,
      },
    }));
  }
}
