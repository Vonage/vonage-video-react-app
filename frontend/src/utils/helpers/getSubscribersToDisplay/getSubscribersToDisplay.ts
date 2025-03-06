import { SubscriberWrapper } from '../../../types/session';
import getMaxSubscriberOnScreenCount from '../getMaxSubscriberOnScreenCount';

export type SubscribersToDisplayAndHide = {
  hiddenSubscribers: SubscriberWrapper[];
  subscribersOnScreen: SubscriberWrapper[];
};

/**
 * Util to separate subscribers into two arrays, the subscribers to display and subscribers that are hidden
 * @param {SubscriberWrapper[]} subscriberWrappers - SubscriberWrapper in display priority order
 * @param {boolean} isViewingLargeTile - is there a large tile (screenshare or active-speaker)
 * @param {boolean} isPublishingScreenshare - whether we are publishing screenshare
 * @returns {SubscribersToDisplayAndHide} - Subscribers to be hidden and Subscribers to be shown
 * }}
 */
const getSubscribersToDisplay = (
  subscriberWrappers: SubscriberWrapper[],
  isViewingLargeTile: boolean,
  isPublishingScreenshare: boolean
): SubscribersToDisplayAndHide => {
  const maxSubscribersOnScreenCount = getMaxSubscriberOnScreenCount(
    isViewingLargeTile,
    isPublishingScreenshare
  );
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
