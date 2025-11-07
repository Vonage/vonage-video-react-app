import { TextField as MUITextField, TextFieldProps as MUITextFieldProps } from '@mui/material';

type TextFieldProps = MUITextFieldProps;

const TextField = (textFieldProps: TextFieldProps) => {
  return <MUITextField {...textFieldProps} />;
};

export default TextField;
