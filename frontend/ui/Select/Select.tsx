import { Select as MUISelect, SelectProps as MUISelectProps } from '@mui/material';

export type SelectProps<T = unknown> = MUISelectProps<T>;

const Select = <T,>(props: SelectProps<T>) => {
  return <MUISelect {...props} />;
};

export default Select;
