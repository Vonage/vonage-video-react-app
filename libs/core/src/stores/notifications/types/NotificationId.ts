import uniqueId from 'react-global-state-hooks/uniqueId';

export type NotificationId = `notification:${string}`;

export const notificationId = uniqueId.for('notification:');

export default NotificationId;
