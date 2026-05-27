import type { NotificationEntry, NotificationId } from '../types';

const initialState = { notifications: new Map<NotificationId, NotificationEntry>() };

export default initialState;
