import {
  MAX_TILES_GRID_VIEW_DESKTOP,
  MAX_TILES_GRID_VIEW_MOBILE,
  MAX_TILES_SPEAKER_VIEW_DESKTOP,
  MAX_TILES_SPEAKER_VIEW_MOBILE,
} from '../../constants';
import { isMobile } from '../../util';

export type GetMaxSubscriberOnScreenCountProps = {
  isViewingLargeTile: boolean;
  isSharingScreen: boolean;
  pinnedSubscriberCount: number;
};

/**
 * Util to get the maximum number of subscribers we should show on screen based on layout mode and device type
 * @param {GetMaxSubscriberOnScreenCountProps} props- function props
 *  @property {boolean} isViewingLargeTile - is there a screenshare of large active speaker tile on screen
 *  @property {boolean} isSharingScreen - whether we are publishing screenshare
 *  @property {boolean} pinnedSubscriberCount - current pinned subscriber count
 * @returns {number} maxSubscriberOnScreenCount - maximum number of subscribers to display
 */
const getMaxSubscriberOnScreenCount = ({
  isViewingLargeTile,
  isSharingScreen,
  pinnedSubscriberCount,
}: GetMaxSubscriberOnScreenCountProps): number => {
  if (isMobile()) {
    return isViewingLargeTile ? MAX_TILES_SPEAKER_VIEW_MOBILE : MAX_TILES_GRID_VIEW_MOBILE;
  }

  if (!isViewingLargeTile) {
    return MAX_TILES_GRID_VIEW_DESKTOP;
  }
  if (isSharingScreen) {
    return MAX_TILES_SPEAKER_VIEW_DESKTOP - 1;
  }
  if (pinnedSubscriberCount > 1) {
    // As subscribers are moved to the pinned area, we allow for one more subscriber in the non-pinned are to replace it.
    return MAX_TILES_SPEAKER_VIEW_DESKTOP + pinnedSubscriberCount - 1;
  }
  return MAX_TILES_SPEAKER_VIEW_DESKTOP;
};

export default getMaxSubscriberOnScreenCount;
