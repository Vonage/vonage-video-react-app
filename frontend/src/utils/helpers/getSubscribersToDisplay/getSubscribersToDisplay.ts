import { SubscriberWrapper } from '../../../types/session';
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
 * @returns {number} maxSubscriberOnScreenCount - maximum number of subscribers to display
 */
const getMaxSubscriberOnScreenCount = (isViewingLargeTile: boolean): number => {
  if (isMobile()) {
    return isViewingLargeTile ? MAX_TILES_SPEAKER_VIEW_MOBILE : MAX_TILES_GRID_VIEW_MOBILE;
  }
  return isViewingLargeTile ? MAX_TILES_SPEAKER_VIEW_DESKTOP : MAX_TILES_GRID_VIEW_DESKTOP;
};

export type SubscribersToDisplayAndHide = {
  hiddenSubscribers: SubscriberWrapper[];
  subscribersOnScreen: SubscriberWrapper[];
};

/**
 * Util to separate subscribers into two arrays, the subscribers to display and subscribers that are hidden
 * @param {SubscriberWrapper[]} subscriberWrappers - SubscriberWrapper in display priority order
 * @param {boolean} isViewingLargeTile - is there a large tile (screenshare or active-speaker)
 * @returns {SubscribersToDisplayAndHide} - Subscribers to be hidden and Subscribers to be shown
 * }}
 */
const getSubscribersToDisplay = (
  subscriberWrappers: SubscriberWrapper[],
  isViewingLargeTile: boolean
): SubscribersToDisplayAndHide => {
  const maxSubscribersOnScreenCount = getMaxSubscriberOnScreenCount(isViewingLargeTile);
  const shouldHideSubscribers = subscriberWrappers.length > maxSubscribersOnScreenCount;

  // If hiding subscribers we slice at max - 1 to make room for hidden participant tile.
  // E.g we either show 3 subs or 2 and a hidden participants tile, hence visible subscriber array length is
  // shorter by one when hiding
  const subscribersOnScreen = shouldHideSubscribers
    ? subscriberWrappers.slice(0, maxSubscribersOnScreenCount - 1)
    : subscriberWrappers;

  const hiddenSubscribers = shouldHideSubscribers
    ? subscriberWrappers.slice(maxSubscribersOnScreenCount - 1, subscriberWrappers.length)
    : [];
  return { subscribersOnScreen, hiddenSubscribers };
};

export default getSubscribersToDisplay;
