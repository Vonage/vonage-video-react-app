import {
  FormControl as MUIFormControl,
  FormControlProps as MUIFormControlProps,
} from '@mui/material';

type FormControlProps = MUIFormControlProps;

const FormControl = (formControlProps: FormControlProps) => {
  return <MUIFormControl {...formControlProps} />;
};

export default FormControl;
