import {
  MAX_TILES_GRID_VIEW_DESKTOP,
  MAX_TILES_GRID_VIEW_MOBILE,
  MAX_TILES_SPEAKER_VIEW_DESKTOP,
  MAX_TILES_SPEAKER_VIEW_MOBILE,
} from '../../constants';
import { isMobile } from '../../util';

/**
 * Util to get the maximum number of subscribers we should show on screen based on layout mode and device type
 * @param {boolean} isViewingLargeTile - is there a screenshare of large active speaker tile on screen
 * @param {boolean} isPublishingScreenshare - whether we are publishing screenshare
 * @returns {number} maxSubscriberOnScreenCount - maximum number of subscribers to display
 */
const getMaxSubscriberOnScreenCount = (
  isViewingLargeTile: boolean,
  isPublishingScreenshare: boolean
): number => {
  if (isMobile()) {
    return isViewingLargeTile ? MAX_TILES_SPEAKER_VIEW_MOBILE : MAX_TILES_GRID_VIEW_MOBILE;
  }
  const maxTileCount = isViewingLargeTile
    ? MAX_TILES_SPEAKER_VIEW_DESKTOP
    : MAX_TILES_GRID_VIEW_DESKTOP;

  // If we are publishing screenshare we allow one less subscriber on screen
  return isPublishingScreenshare ? maxTileCount - 1 : maxTileCount;
};

export default getMaxSubscriberOnScreenCount;
