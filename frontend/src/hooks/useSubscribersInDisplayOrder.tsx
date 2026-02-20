import getSubscribersInDisplayOrder from '../utils/helpers/getSubscribersInDisplayOrder';
import { SubscriberWrapper } from '../types/session';
import { useAccumulator } from '@web/hooks';

/**
 * Hook to get SubscriberWrappers in display order. This hook keeps the state of previous subscribers on screen
 * and uses this to determine how to display subscribers such that they maintain they're position on screen whilst
 * finding the optimal position to place new subscribers.
 * @param {SubscriberWrapper[]} subscribersOnScreen - an array of SubscriberWrappers that should be displayed
 * @returns {SubscriberWrapper[]} subscribersInDisplayOrder - SubscriberWrappers to be displayed in display order
 */
const useSubscribersInDisplayOrder = (subscribersOnScreen: SubscriberWrapper[]) => {
  return useAccumulator(
    (previousDisplayOrder): SubscriberWrapper[] => {
      return getSubscribersInDisplayOrder(subscribersOnScreen, previousDisplayOrder ?? []);
    },
    [subscribersOnScreen]
  ).current;
};

export default useSubscribersInDisplayOrder;
