import { Link as MUILink, LinkProps as MUILinkProps } from '@mui/material';

type LinkProps = MUILinkProps;

const Link = ({ ...linkProps }: LinkProps) => {
  return <MUILink {...linkProps} />;
};

export default Link;
