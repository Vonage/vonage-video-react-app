import uniqueId from 'react-global-state-hooks/uniqueId';

export type NotificationId = `notification:${string}`;

export const notificationId = uniqueId.for('notification:') as {
  (): NotificationId;
  is(value: unknown): value is NotificationId;
  assert(value: unknown): asserts value is NotificationId;
};

export default NotificationId;
