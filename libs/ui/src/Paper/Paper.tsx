import { Paper as MUIPaper, PaperProps as MUIPaperProps } from '@mui/material';

export type PaperProps = MUIPaperProps;

const Paper = (paperProps: PaperProps) => {
  return <MUIPaper {...paperProps} />;
};

export default Paper;
