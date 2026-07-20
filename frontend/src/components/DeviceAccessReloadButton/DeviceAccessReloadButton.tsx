import { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import reloadPage from '@utils/reloadPage';

export type DeviceAccessReloadButtonProps = ComponentProps<'button'>;

/**
 * DeviceAccessReloadButton Component
 *
 * Text button that reloads the page to recover from a browser-blocked camera/microphone. On Safari a
 * reload is the reliable way to make the getUserMedia prompt reappear after a device was denied —
 * WebKit stops prompting for that device for the rest of the document's lifetime, so no in-page
 * re-request can bring the prompt back. Text color is inherited so it reads correctly inside both
 * the waiting-room hint pill and the in-call alert.
 * @param {DeviceAccessReloadButtonProps} props - standard button props; className is merged onto the root.
 * @returns {ReactElement} The reload button.
 */
const DeviceAccessReloadButton = ({
  className,
  onClick,
  ...props
}: DeviceAccessReloadButtonProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      data-testid="device-access-reload-button"
      onClick={(event) => {
        onClick?.(event);
        reloadPage();
      }}
      className={classNames(
        'shrink-0 text-inherit underline underline-offset-2 hover:opacity-80',
        className
      )}
      {...props}
    >
      {t('deviceAccessHint.reload')}
    </button>
  );
};

export default DeviceAccessReloadButton;
