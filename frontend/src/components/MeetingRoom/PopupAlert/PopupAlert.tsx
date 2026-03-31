import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import type { SxProps } from '@mui/material';
import { ReactElement, useState } from 'react';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import useOnMountEffect from '@web/hooks/useMountEffect';

export type PopupAlertProps = {
  title: string;
  message: string;
  closable?: boolean;
  severity: 'warning' | 'error' | 'info';
  timeout?: number;
};

/**
 * PopupAlert Component
 * An MUI Alert to display the title and message for connection issues.
 * @param {PopupAlertProps} props - the props for this component
 * @property {boolean} [closable] (optional) default false - whether alert should be closable
 * @property {string} title - Alert title
 * @property {string} message - Alert message body
 * @property {'warning' | 'error' | 'info'} severity - MUI Severity, warning, error, or info. Determines color and icon of Alert
 * @returns {ReactElement | false} PopupAlert Component
 */
const PopupAlert = ({
  closable = false,
  title,
  message,
  severity,
  timeout,
}: PopupAlertProps): ReactElement | false => {
  const [closed, setClosed] = useState(false);
  const isSmallViewport = useIsSmallViewport();

  useOnMountEffect(() => {
    if (timeout === undefined) return;

    const timer = setTimeout(() => {
      setClosed(true);
    }, timeout);

    return () => clearTimeout(timer);
  });
  const sxProps: SxProps = isSmallViewport
    ? {
        left: '50%',
        transform: 'translate(-50%, 0%)',
        // We account for the SmallViewportHeader
        top: '64px',
      }
    : {
        left: '0.25rem',
        top: '0.25rem',
      };

  return (
    !closed && (
      <Alert
        severity={severity}
        variant="standard"
        color={severity}
        {...(closable
          ? {
              onClose: () => {
                setClosed(true);
              },
            }
          : {})}
        sx={{
          ...sxProps,
          position: 'absolute',
          width: '100%',
          maxWidth: '320px',
        }}
      >
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    )
  );
};

export default PopupAlert;
