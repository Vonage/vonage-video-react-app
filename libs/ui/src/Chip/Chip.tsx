import { Chip as MUIChip, ChipProps as MUIChipProps } from '@mui/material';

export type ChipProps = MUIChipProps;

const Chip = (chipProps: ChipProps) => {
  return <MUIChip {...chipProps} />;
};

export default Chip;
