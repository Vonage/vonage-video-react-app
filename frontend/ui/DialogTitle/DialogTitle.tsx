import {
  DialogTitle as MUIDialogTitle,
  DialogTitleProps as MUIDialogTitleProps,
} from '@mui/material';

type DialogTitleProps = MUIDialogTitleProps;

const DialogTitle = ({ ...dialogTitleProps }: DialogTitleProps) => {
  return <MUIDialogTitle {...dialogTitleProps} />;
};

export default DialogTitle;
