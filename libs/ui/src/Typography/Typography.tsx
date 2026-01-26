import { Typography as MUITypography, TypographyProps as MUITypographyProps } from '@mui/material';

export type TypographyProps = MUITypographyProps;

const Typography = (typographyProps: TypographyProps) => {
  return <MUITypography {...typographyProps} />;
};

export default Typography;
