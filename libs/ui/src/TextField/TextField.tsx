import { TextField as MUITextField, TextFieldProps as MUITextFieldProps } from '@mui/material';

export type TextFieldProps = MUITextFieldProps;

const TextField = (textFieldProps: TextFieldProps) => {
  return <MUITextField {...textFieldProps} />;
};

export default TextField;
