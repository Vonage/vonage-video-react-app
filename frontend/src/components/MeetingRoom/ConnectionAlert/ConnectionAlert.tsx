import { Alert, AlertTitle, SxProps } from '@mui/material';
import { ReactElement, useState } from 'react';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type ConnectionAlertProps = {
  title: string;
  message: string;
  closable?: boolean;
  severity: 'warning' | 'error';
};

/**
 * ConnectionAlert Component
 * An MUI Alert to display the title and message for connection issues.
 * @param {ConnectionAlertProps} props - the props for this component
 * @property {boolean} [closable] (optional) default false - whether alert should be closable
 * @property {string} title - Alert title
 * @property {string} message - Alert message body
 * @property {'warning' | 'error'} severity - MUI Severity, warning or error. Determines color and icon of Alert
 * @returns {ReactElement | false} ConnectionAlert Component
 */
const ConnectionAlert = ({
  closable = false,
  title,
  message,
  severity,
}: ConnectionAlertProps): ReactElement | false => {
  const [closed, setClosed] = useState(false);
  const isSmallViewPort = useIsSmallViewport();
  const sxProps: SxProps = isSmallViewPort
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
        color="error"
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

export default ConnectionAlert;
