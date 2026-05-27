import { notificationId, type NotificationEntry, type NotificationsAPI } from '../types';

function pushNotification(
  this: NotificationsAPI['actions'],
  payload: Omit<NotificationEntry, 'id'>
) {
  return ({ setState }: NotificationsAPI) => {
    const entry: NotificationEntry = { ...payload, id: notificationId() };

    if (!this.hasSubscribers()) {
      console.warn(
        [
          'A notification was pushed, but the notifications store has no active React consumer.',
          'This notification will not be visible to users.',
          'Render NotificationsContainer or provide a custom notification handler.',
        ].join('\n')
      );
    }

    setState((state) => {
      const notifications = new Map(state.notifications);
      notifications.set(entry.id, entry);
      return { ...state, notifications };
    });
  };
}

export default pushNotification;
