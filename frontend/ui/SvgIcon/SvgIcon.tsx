import { SvgIcon as MUISvgIcon, SvgIconProps as MUISvgIconProps } from '@mui/material';

type SvgIconProps = MUISvgIconProps;

const SvgIcon = (svgIconProps: SvgIconProps) => {
  return <MUISvgIcon {...svgIconProps} />;
};

export default SvgIcon;
