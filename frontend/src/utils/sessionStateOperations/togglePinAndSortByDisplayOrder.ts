import { SubscriberWrapper } from '../../types/session';
import sortByDisplayPriority from './sortByDisplayPriority';

/**
 * togglePinAndSortByDisplayOrder - a util to operate on React State array of subscriberWrappers.
 * This util will toggle the pinned state for the subscriber with the id passed in,
 * and also re-order the array to ensure pinned subscribers are above regular the rest.
 * (See ./sortByDisplayPriority for more details).
 * @param {string} id - id of subscriber to pin / unpin.
 * @param {SubscriberWrapper[]} previousSubscriberWrappers - previous array, obtained from setState function callback
 * @param {(string | undefined)} activeSpeakerId - current activeSpeakerId
 * @returns {SubscriberWrapper[]} - updated copy of subscriberWrapper array (React state is read-only so a copy is made).
 */
const togglePinAndSortByDisplayOrder = (
  id: string,
  previousSubscriberWrappers: SubscriberWrapper[],
  activeSpeakerId: string | undefined
) => {
  const subscribers = previousSubscriberWrappers
    .map((subscriberWrapper) => {
      if (subscriberWrapper.id === id) {
        return {
          ...subscriberWrapper,
          isPinned: !subscriberWrapper.isPinned,
        };
      }
      return subscriberWrapper;
    })
    .sort(sortByDisplayPriority(activeSpeakerId)); // Sorting by display priority will place this pinned participant above the rest
  return subscribers;
};

export default togglePinAndSortByDisplayOrder;
