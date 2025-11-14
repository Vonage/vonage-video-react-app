import {
  InputAdornment as MUIInputAdornment,
  InputAdornmentProps as MUIInputAdornmentProps,
} from '@mui/material';

type InputAdornmentProps = MUIInputAdornmentProps;

const InputAdornment = ({ ...inputAdornmentProps }: InputAdornmentProps) => {
  return <MUIInputAdornment {...inputAdornmentProps} />;
};

export default InputAdornment;
