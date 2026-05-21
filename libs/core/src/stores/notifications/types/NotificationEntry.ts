import type NotificationId from './NotificationId';
import type NotificationType from './NotificationType';

export type NotificationEntry = {
  id: NotificationId;
  type: NotificationType;
  message: string;
  expirationMs: number | null;
  children?: React.ReactNode;
};

export default NotificationEntry;
