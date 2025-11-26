import { Paper as MUIPaper, PaperProps as MUIPaperProps } from '@mui/material';

type PaperProps = MUIPaperProps;

const Paper = (paperProps: PaperProps) => {
  return <MUIPaper {...paperProps} />;
};

export default Paper;
