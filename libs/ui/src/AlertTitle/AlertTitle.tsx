import { AlertTitle as MUIAlertTitle, AlertTitleProps as MUIAlertTitleProps } from '@mui/material';

type AlertTitleProps = MUIAlertTitleProps;

const AlertTitle = (alertTitleProps: AlertTitleProps) => {
  return <MUIAlertTitle {...alertTitleProps} />;
};

export default AlertTitle;
