import type { NotificationsAPI } from '../types';
import type NotificationId from '../types/NotificationId';

function dismissNotification(this: NotificationsAPI['actions'], id: NotificationId) {
  return ({ setState }: NotificationsAPI) => {
    setState((state) => {
      const notifications = new Map(state.notifications);
      notifications.delete(id);
      return { ...state, notifications };
    });
  };
}

export default dismissNotification;
