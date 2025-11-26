import {
  ButtonGroup as MUIButtonGroup,
  ButtonGroupProps as MUIButtonGroupProps,
} from '@mui/material';

type ButtonGroupProps = MUIButtonGroupProps;

const ButtonGroup = (buttonGroupProps: ButtonGroupProps) => {
  return <MUIButtonGroup {...buttonGroupProps} />;
};

export default ButtonGroup;
