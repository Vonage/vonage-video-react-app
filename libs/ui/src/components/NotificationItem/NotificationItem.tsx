import {
  useEffect,
  type ReactElement,
  PropsWithChildren,
  ComponentProps,
  CSSProperties,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { NotificationEntry, NotificationId } from '@core/stores/notifications';
import VividIcon from '@ui/VividIcon';
import classNames from 'classnames';
import { twMerge } from 'tailwind-merge';
import { Prettify } from '@common/types';
import { isString } from '@common/assertions';

const typeIconName: Record<NotificationEntry['type'], string> = {
  info: 'info-line',
  warning: 'warning-line',
  success: 'check-circle-line',
};

const typeIconColorVar: Record<NotificationEntry['type'], string> = {
  info: 'var(--vera-information)',
  warning: 'var(--vera-warning)',
  success: 'var(--vera-success)',
};

type NotificationItemProps = PropsWithChildren<
  Prettify<
    ComponentProps<'div'> &
      NotificationEntry & {
        onDismiss: (id: NotificationId) => void;
        iconStyle?: CSSProperties;
      }
  >
>;

function NotificationItem({
  id,
  type,
  message,
  expirationMs,
  onDismiss,
  children,
  className,
  iconStyle,
  ...rest
}: NotificationItemProps): ReactElement {
  const { t } = useTranslation();

  useEffect(() => {
    if (expirationMs === null) return;

    const timer = setTimeout(() => onDismiss(id), expirationMs);

    return () => clearTimeout(timer);
  }, [id, expirationMs, onDismiss]);

  const iconColorStyle: CSSProperties = {
    color: typeIconColorVar[type],
    pointerEvents: 'none',
    ...iconStyle,
  };

  return (
    <div
      role="alert"
      className={twMerge(
        classNames(
          'animate-fade-in',
          'max-sm:w-full w-90 grid grid-cols-[auto_1fr_auto]',
          'pointer-events-auto! items-start gap-3 p-3 rounded-lg text-vera-body-base shadow-md border border-vera-border bg-vera-background',
          className
        )
      )}
      {...rest}
    >
      <div>
        <VividIcon name={typeIconName[type]} customSize={-5} style={iconColorStyle} />
      </div>

      <div className={'flex flex-1 flex-col gap-3 text-left'}>
        {isString(message) ? (
          <p dangerouslySetInnerHTML={{ __html: message }} className="wrap-anywhere" />
        ) : (
          message
        )}

        {children}
      </div>

      <button
        aria-label={t('notification.dismiss')}
        className={'px-1 cursor-pointer! hover:opacity-40'}
        onClick={() => {
          onDismiss(id);
        }}
      >
        <VividIcon name="close-line" customSize={-6} />
      </button>
    </div>
  );
}

export default NotificationItem;
