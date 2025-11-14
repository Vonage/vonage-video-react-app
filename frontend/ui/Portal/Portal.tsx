import { Portal as MUIPortal, PortalProps as MUIPortalProps } from '@mui/material';

type PortalProps = MUIPortalProps;

const Portal = (portalProps: PortalProps) => {
  return <MUIPortal {...portalProps} />;
};

export default Portal;
