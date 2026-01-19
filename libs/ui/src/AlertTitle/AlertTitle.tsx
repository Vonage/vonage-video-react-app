import { AlertTitle as MUIAlertTitle, AlertTitleProps as MUIAlertTitleProps } from '@mui/material';

export type AlertTitleProps = MUIAlertTitleProps;

const AlertTitle = (alertTitleProps: AlertTitleProps) => {
  return <MUIAlertTitle {...alertTitleProps} />;
};

export default AlertTitle;
