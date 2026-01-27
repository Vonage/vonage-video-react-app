import { Tooltip as MUITooltip, TooltipProps as MUITooltipProps } from '@mui/material';

export type TooltipProps = MUITooltipProps;

const Tooltip = (tooltipProps: TooltipProps) => {
  return <MUITooltip {...tooltipProps} />;
};

export default Tooltip;
