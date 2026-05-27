import createGlobalState from 'react-global-state-hooks/createGlobalState';
import { pushNotification, dismissNotification, clearAllNotifications } from './actions';
import { InferAPI } from 'react-hooks-global-states';
import { initialValue } from './constants';

export type NotificationsAPI = InferAPI<typeof notifications$>;

const notifications$ = createGlobalState(initialValue, {
  name: 'notifications',
  actions: {
    push: pushNotification,

    dismiss: dismissNotification,

    clearAll: clearAllNotifications,

    /**
     * Returns whether there are any subscribers to the notifications store.
     */
    hasSubscribers: () => {
      return () => {
        return Boolean(notifications$.subscribers.size);
      };
    },
  },
});

export default notifications$;
