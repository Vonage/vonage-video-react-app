import { type ReactElement } from 'react';
import { tv } from 'tailwind-variants';
import notifications$ from '@core/stores/notifications';
import type { NotificationId } from '@core/stores/notifications';
import NotificationItem from '../NotificationItem';

type NotificationPosition = 'top-right' | 'bottom-center';

const NotificationsContainer = ({
  position = 'top-right',
}: NotificationsContainerProps): ReactElement => {
  const notifications = notifications$.use.select(({ notifications }) => notifications);

  const handleDismiss = (id: NotificationId) => {
    notifications$.actions.dismiss(id);
  };

  return (
    <div aria-live="polite" className={styles({ position })}>
      {[...notifications.values()].map((notification) => (
        <NotificationItem key={notification.id} {...notification} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};

const variants = tv({
  base: 'fixed z-1400 flex flex-col gap-3 pointer-events-none max-sm:w-[calc(100%-12px)] pl-3',
  variants: {
    position: {
      'top-right': 'top-4 right-3',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
    },
  },
  defaultVariants: {
    position: 'top-right',
  },
});

function styles({ position }: { position: NotificationPosition }) {
  return variants({ position });
}

type NotificationsContainerProps = {
  position?: 'top-right' | 'bottom-center';
};

export default NotificationsContainer;
