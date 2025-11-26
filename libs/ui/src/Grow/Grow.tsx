import { Grow as MUIGrow, GrowProps as MUIGrowProps } from '@mui/material';

type GrowProps = MUIGrowProps;

const Grow = (growProps: GrowProps) => {
  return <MUIGrow {...growProps} />;
};

export default Grow;
