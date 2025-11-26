import { Fade as MUIFade, FadeProps as MUIFadeProps } from '@mui/material';

type FadeProps = MUIFadeProps;

const Fade = (fadeProps: FadeProps) => {
  return <MUIFade {...fadeProps} />;
};

export default Fade;
