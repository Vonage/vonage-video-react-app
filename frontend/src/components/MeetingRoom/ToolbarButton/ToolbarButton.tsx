import { IconButton, SxProps } from '@mui/material';
import { ForwardedRef, forwardRef, ReactElement, MouseEvent, TouchEvent } from 'react';

export type ToolbarButtonProps = {
  onClick:
    | (() => void)
    | ((event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) => void);
  icon: ReactElement;
  sx?: SxProps;
  id?: string;
  isOverflowButton?: boolean;
};

/**
 * ToolbarButton Component
 * A common component for toolbar buttons to share styling.
 * @param {ToolbarButtonProps} props - props for the component
 *   @property {Function} onClick - on click handler
 *   @property {ReactElement} icon - MUI Icon for button
 *   @property {SxProps} sx - (optional) MUI style object
 *   @property {string} id - (optional) the data-testid used in unit tests
 *   @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 * @returns {ReactElement}
 */
const ToolbarButton = forwardRef(function ToolbarButton(
  props: ToolbarButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const { icon: Icon, sx = {}, isOverflowButton, ...rest } = props;

  return (
    <IconButton
      {...rest}
      edge="start"
      size="small"
      ref={ref}
      sx={{
        marginLeft: '0px',
        marginTop: '4px',
        marginRight: '12px',
        width: isOverflowButton ? '35px' : '48px',
        height: isOverflowButton ? '35px' : '48px',
        backgroundColor: 'rgba(60, 64, 67, 0.55)',
        '&:hover': {
          backgroundColor: 'rgba(60, 64, 67, 0.42)',
        },
        ...sx,
      }}
    >
      {Icon}
    </IconButton>
  );
});

export default ToolbarButton;
