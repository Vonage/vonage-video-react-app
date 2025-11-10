import { Alert as MUIAlert, AlertProps as MUIAlertProps } from '@mui/material';

type AlertProps = MUIAlertProps;

const Alert = (alertProps: AlertProps) => {
  return <MUIAlert {...alertProps} />;
};

export default Alert;
