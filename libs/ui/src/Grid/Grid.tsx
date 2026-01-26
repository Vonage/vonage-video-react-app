import { Grid as MUIGrid, GridProps as MUIGridProps } from '@mui/material';

export type GridProps = MUIGridProps;

const Grid = (gridProps: GridProps) => {
  return <MUIGrid {...gridProps} />;
};

export default Grid;
