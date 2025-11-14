import { Stack as MUIStack, StackProps as MUIStackProps } from '@mui/material';

type StackProps = MUIStackProps;

const Stack = (stackProps: StackProps) => {
  return <MUIStack {...stackProps} />;
};

export default Stack;
