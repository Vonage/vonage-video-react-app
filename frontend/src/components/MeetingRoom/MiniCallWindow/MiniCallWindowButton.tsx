import type { ReactElement } from 'react';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { tv } from 'tailwind-variants';

export type MiniCallWindowButtonProps = Omit<IconButtonProps, 'sx' | 'title'> & {
  title: string;
  variant?: 'neutral' | 'danger';
};

const miniCallWindowButton = tv({
  base: 'box-border size-8 rounded-full! p-1!',
  variants: {
    variant: {
      neutral: 'bg-vera-dark-background!',
      danger: 'bg-vera-error!',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

/**
 * Round control button for the Mini Mode window, with a tooltip.
 * The tooltip is rendered inline because a portal would mount it in the opener document.
 * @param {MiniCallWindowButtonProps} props - IconButton props plus the tooltip title and color variant
 * @returns {ReactElement} The button wrapped in its tooltip
 */
const MiniCallWindowButton = ({
  title,
  variant,
  className,
  children,
  ...props
}: MiniCallWindowButtonProps): ReactElement => (
  <Tooltip title={title} slotProps={{ popper: { disablePortal: true } }}>
    <IconButton className={miniCallWindowButton({ variant, className })} {...props}>
      {children}
    </IconButton>
  </Tooltip>
);

export default MiniCallWindowButton;
