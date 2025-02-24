import { Alert, AlertTitle, Stack } from '@mui/material';
import { ReactElement, useState } from 'react';

export type ConnectionAlertProps = {
  title: string;
  message: string;
  closable?: boolean;
  severity: 'warning' | 'error';
};

const maxWidth = '@apply max-w-[calc(100vw_-_8px)]';
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

  return (
    !closed && (
      <Stack className={`absolute left-1 top-1 ${maxWidth}`}>
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
        >
          <AlertTitle>{title}</AlertTitle>
          {message}
        </Alert>
      </Stack>
    )
  );
};

export default ConnectionAlert;
