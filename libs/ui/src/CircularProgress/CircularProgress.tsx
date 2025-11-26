import {
  CircularProgress as MUICircularProgress,
  CircularProgressProps as MUICircularProgressProps,
} from '@mui/material';

type CircularProgressProps = MUICircularProgressProps;

const CircularProgress = (circularProgressProps: CircularProgressProps) => {
  return <MUICircularProgress {...circularProgressProps} />;
};

export default CircularProgress;
