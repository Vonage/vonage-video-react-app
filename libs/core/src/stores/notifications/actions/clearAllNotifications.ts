import type { NotificationsAPI } from '../types';

function clearAllNotifications() {
  return ({ setState }: NotificationsAPI) => {
    setState((state) => ({ ...state, notifications: new Map() }));
  };
}

export default clearAllNotifications;
