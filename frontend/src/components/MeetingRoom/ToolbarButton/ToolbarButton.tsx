import { ForwardedRef, forwardRef, ReactElement } from 'react';
import classNames from 'classnames';
import { IconButton, IconButtonProps } from '@mui/material';
import { twMerge } from 'tailwind-merge';

export type ToolbarButtonProps = IconButtonProps & {
  icon: ReactElement;
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
  const { className, icon: Icon, sx = {}, isOverflowButton, ...rest } = props;

  return (
    <IconButton
      className={twMerge(
        classNames('bg-vera-dark-grey! hover:bg-vera-dark-grey-opacity', className)
      )}
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
        ...sx,
      }}
    >
      {Icon}
    </IconButton>
  );
});

export default ToolbarButton;
