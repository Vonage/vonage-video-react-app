import { SubscriberWrapper } from '../../types/session';

/**
 * Sorts screensharing subscribers and active speakers as high display priority.
 * @param {string | undefined} activeSpeakerId The activeSpeakerId for the session, or undefined if there is none.
 * @returns {Function} Curried function returning a number corresponding to which participant has priority.
 */
const sortByDisplayPriority =
  (
    activeSpeakerId: string | undefined
  ): ((wrapperA: SubscriberWrapper, wrapperB: SubscriberWrapper) => 1 | -1 | 0) =>
  (wrapperA: SubscriberWrapper, wrapperB: SubscriberWrapper) => {
    // We want the screenshare subscribers to be prioritized, first.
    if (wrapperA.isScreenshare) {
      return -1;
    }
    if (wrapperB.isScreenshare) {
      return 1;
    }
    if (wrapperA.isPinned) {
      return -1;
    }
    if (wrapperB.isPinned) {
      return 1;
    }
    // We prioritize the active speaker after the screenshare so whoever is speaking is always displayed.
    if (wrapperA.id === activeSpeakerId) {
      return -1;
    }
    if (wrapperB.id === activeSpeakerId) {
      return 1;
    }
    // If there's no higher priority subscriber, retain the current order.
    return 0;
  };

export default sortByDisplayPriority;
