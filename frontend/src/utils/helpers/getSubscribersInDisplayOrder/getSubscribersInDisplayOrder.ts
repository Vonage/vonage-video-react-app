import { SubscriberWrapper } from '../../../types/session';

/* Subscriber Display Order

  Subscriber display order is based on two states:
  - Subscribers to be displayed
  - Previous display order
  The function of this code is to return a display order for subscribers that
  - Keeps previously displayed subscribers in their position if they are still displayed
  - Adds newly displayed subscribers into the gaps left by hidden subscribers

  The logic for hiding and displaying subscribers is not the responsibility of this component.

  The logic deals with 3 scenarios

  1) Increasing subscriber number - subscribers are added such that existing order is respected.
  Occurs when:
  - first subscribers joining a call
  - subscribers number still below hiding threshold

  Example:
  Adding 4 Subscribers

  previousDisplayOrder: []              previousDisplayOrder: ['sub1']                  previousDisplayOrder: ['sub1', 'sub2', 'sub3']
  subscribersToDisplay: ['sub1'] ---->  subscribersToDisplay: ['sub2', 'sub1'] ------>  subscribersToDisplay: ['sub3', 'sub2', 'sub1']
  result:['sub1]                        result:['sub1', sub2']                          result:['sub1', sub2', 'sub3']

  +--------------+                      +-----------------------------+                 +-----------------------------+
  |              |                      |                             |                 |                             |
  | sub1         |                      | sub1          sub2          |                 | sub1          sub2          |
  | (position 0) |                      | (position 0)  (position 1)  |                 | (position 0)  (position 1)  |
  |              |                      |                             |                 |                             |
  |              |                      |                             |                 | sub3                        |
  |              |                      |                             |                 | (position 2)                |
  +--------------+                      +-----------------------------+                 +-----------------------------+

  2) Equal subscriber number - newly shown subscribers replace removed subscribers without changing non-hidden subscriber order
  Occurs when:
  - Subscribers are hidden by active speaker logic
  - Subscribers are hidden by new subscribers or screenshare
  - Subscriber have disconnected and are replaced by a previously hidden subscriber

  Example:
  New subscriber replaces existing subscriber on screen.
  For the example we use a case where the subscribers on screen limit is 4.

                                                                      previousDisplayOrder: ['sub1', 'sub2', 'sub3', 'sub4']
  previousDisplayOrder: ['sub1', 'sub2', 'sub3', 'sub4'] --------->  subscribersToDisplay: ['sub5', 'sub4', 'sub3', 'sub2']
                                                                      result:['sub5', sub2', 'sub3', 'sub4']

  +-----------------------------+                                    +-----------------------------+
  |                             |                                    |                             |
  | sub1          sub2          |                                    | sub5          sub2          |
  | (position 0)  (position 1)  |                                    | (position 0)  (position 1)  |
  |                             |                                    |                             |
  | sub3          sub4          |                                    | sub3          sub4          |
  | (position 2)  (position 3)  |                                    | (position 2)  (position 3)  |
  +-----------------------------+                                    +-----------------------------+

  3) Decreasing subscriber number - Subscribers maintain order but collapse any gaps in index
  Occurs when:
  - Subscribers disconnect and subscriber number is now less than display limit
  - Display limit is decreased by change in layout mode

  Example:
  - Display limit changes from 4 to 3 (example values) due to e.g. active speaker mode being selected

                                                                    previousDisplayOrder: ['sub1', 'sub2', 'sub3', 'sub4']
  previousDisplayOrder: ['sub1', 'sub2', 'sub3', 'sub4'] --------->  subscribersToDisplay: ['sub4', 'sub3', 'sub2']
                                                                    result:['sub2', 'sub3', 'sub4']
  +-----------------------------+                                    +-----------------------------+
  |                             |                                    |                             |
  | sub1          sub2          |                                    | sub2          sub3          |
  | (position 0)  (position 1)  |                                    | (position 0)  (position 1)  |
  |                             |                                    |                             |
  | sub3          sub4          |                                    | sub4                        |
  | (position 2)  (position 3)  |                                    | (position 2)                |
  +-----------------------------+                                    +-----------------------------+
*/

const getSubscribersIdsInDisplayOrder = (
  subscribersToDisplay: string[],
  previousDisplayOrder: string[]
): string[] => {
  const subscribersToDisplaySet = new Set(subscribersToDisplay);
  const previousDisplayOrderSet = new Set(previousDisplayOrder);

  const newIds = subscribersToDisplay.filter((id) => !previousDisplayOrderSet.has(id));
  const removedIds = previousDisplayOrder.filter((id) => !subscribersToDisplaySet.has(id));

  // Loop through previous order
  const previousOrderMapped = previousDisplayOrder
    .map((id) => {
      // If the id hasn't been removed, keep the same index
      if (!removedIds.includes(id)) {
        return id;
      }
      // If the id has been removed, fill in gaps with new ids
      return newIds.shift() as string;
    })
    // if there are now less shown before then we will have undefined gaps in array so filter them out
    .filter((id) => id !== undefined);

  // If there are now more subscribers shown than before then we will have ids yet to allocate so append them to the end
  const finalOrder = [...previousOrderMapped, ...newIds];

  return finalOrder;
};

const toId = ({ id }: SubscriberWrapper) => id;

const toSubscriberWrapper = (subscriberWrappers: SubscriberWrapper[]) => (subId: string) => {
  return subscriberWrappers.find(({ id }) => id === subId) as SubscriberWrapper;
};

/**
 * A helper function to determine subscriber display order based on previous order.
 * This order keeps existing subscribers in the same place they were before, and replaces subscribers that are being hidden or have left
 * with previously hidden subscribers.
 * @param {SubscriberWrapper[]} subscribersToDisplay - an array of SubscriberWrappers to be displayed
 * @param {SubscriberWrapper[]} previousDisplayOrder - an array of the previous SubscriberWrappers in previous display order
 * @returns {SubscriberWrapper[]} An array of SubscriberWrappers in the order they should be displayed on screen
 */
const getSubscribersInDisplayOrder = (
  subscribersToDisplay: SubscriberWrapper[],
  previousDisplayOrder: SubscriberWrapper[]
): SubscriberWrapper[] => {
  // Map everything to ids so it's easier to manipulate the arrays
  const subscribersToDisplayIds = subscribersToDisplay.map(toId);
  const previousDisplayOrderIds = previousDisplayOrder.map(toId);
  const orderedIds = getSubscribersIdsInDisplayOrder(
    subscribersToDisplayIds,
    previousDisplayOrderIds
  );
  // Map everything back from ids to SubscriberWrappers before returning
  return orderedIds.map(toSubscriberWrapper(subscribersToDisplay));
};
export default getSubscribersInDisplayOrder;
