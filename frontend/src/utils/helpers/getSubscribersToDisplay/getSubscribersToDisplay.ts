import { SubscriberWrapper } from '../../../types/session';
import getMaxSubscriberOnScreenCount from '../getMaxSubscriberOnScreenCount';

export type SubscribersToDisplayAndHide = {
  hiddenSubscribers: SubscriberWrapper[];
  subscribersOnScreen: SubscriberWrapper[];
};

export type GetSubscribersToDisplayProps = {
  subscriberWrappers: SubscriberWrapper[];
  isSharingScreen: boolean;
  pinnedSubscriberCount: number;
  isViewingLargeTile: boolean;
};

/**
 * Util to separate subscribers into two arrays, the subscribers to display and subscribers that are hidden
 * @param {GetSubscribersToDisplayProps} props- function props
 *  @property {SubscriberWrapper[]} subscriberWrappers - SubscriberWrapper in display priority order
 *  @property {boolean} isViewingLargeTile - is there a large tile (screenshare or active-speaker)
 *  @property {boolean} isPublishingScreenshare - whether we are publishing screenshare
 * @returns {SubscribersToDisplayAndHide} - Subscribers to be hidden and Subscribers to be shown
 * }}
 */
const getSubscribersToDisplay = ({
  subscriberWrappers,
  isViewingLargeTile,
  isSharingScreen,
  pinnedSubscriberCount,
}: GetSubscribersToDisplayProps): SubscribersToDisplayAndHide => {
  const maxSubscribersOnScreenCount = getMaxSubscriberOnScreenCount({
    isViewingLargeTile,
    isSharingScreen,
    pinnedSubscriberCount,
  });
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
