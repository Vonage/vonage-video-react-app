import { Alert as MUIAlert, AlertProps as MUIAlertProps } from '@mui/material';

export type AlertProps = MUIAlertProps;

const Alert = (alertProps: AlertProps) => {
  return <MUIAlert {...alertProps} />;
};

export default Alert;
