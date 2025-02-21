import { SubscriberWrapper } from '../../types/session';
import sortByDisplayPriority from './sortByDisplayPriority';

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
