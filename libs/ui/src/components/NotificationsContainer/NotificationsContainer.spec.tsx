import { render, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import notifications$ from '@core/stores/notifications';
import type { NotificationId } from '@core/stores/notifications';
import NotificationsContainer from './NotificationsContainer';

// Record the onDismiss reference each rendered NotificationItem receives.
const receivedOnDismiss: Array<(id: NotificationId) => void> = [];

vi.mock('../NotificationItem', () => ({
  __esModule: true,
  default: ({ onDismiss }: { onDismiss: (id: NotificationId) => void }) => {
    receivedOnDismiss.push(onDismiss);
    return null;
  },
}));

describe('NotificationsContainer', () => {
  afterEach(() => {
    receivedOnDismiss.length = 0;
    act(() => {
      notifications$.actions.clearAll();
    });
  });

  it('passes a stable onDismiss across re-renders so item auto-dismiss timers are not reset', () => {
    render(<NotificationsContainer />);

    act(() => {
      notifications$.actions.push({ type: 'info', message: 'first', expirationMs: 5000 });
    });

    // Adding a second notification re-renders the container (and thus every item).
    act(() => {
      notifications$.actions.push({ type: 'info', message: 'second', expirationMs: 5000 });
    });

    expect(receivedOnDismiss.length).toBeGreaterThan(1);
    // Every NotificationItem across every render must get the same onDismiss reference; otherwise
    // each item's effect ([id, expirationMs, onDismiss]) re-runs and restarts its dismiss timer.
    expect(new Set(receivedOnDismiss).size).toBe(1);
  });
});
