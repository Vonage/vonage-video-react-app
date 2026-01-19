import { Link as MUILink, LinkProps as MUILinkProps } from '@mui/material';

export type LinkProps = MUILinkProps;

const Link = (linkProps: LinkProps) => {
  return <MUILink {...linkProps} />;
};

export default Link;
