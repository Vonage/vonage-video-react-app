import { ForwardedRef, forwardRef, ReactElement } from 'react';
import { IconButton, IconButtonProps } from '@mui/material';
import { tv } from 'tailwind-variants';

export type ToolbarButtonProps = Omit<IconButtonProps, 'sx'> & {
  icon: ReactElement;
  isOverflowButton?: boolean;
};

const toolbarButton = tv({
  base: 'bg-vera-dark-grey! hover:bg-vera-dark-grey-opacity ml-0! mt-[4px] mr-[12px]',
  variants: {
    isOverflowButton: {
      true: 'size-[35px]',
      false: 'size-12',
    },
  },
});

/**
 * ToolbarButton Component
 * A common component for toolbar buttons to share styling.
 * @param {ToolbarButtonProps} props - props for the component
 *   @property {Function} onClick - on click handler
 *   @property {ReactElement} icon - MUI Icon for button
 *   @property {string} className - (optional) classes merged into the button classes
 *   @property {string} id - (optional) the data-testid used in unit tests
 *   @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 * @returns {ReactElement}
 */
const ToolbarButton = forwardRef(function ToolbarButton(
  props: ToolbarButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const { className, icon: Icon, isOverflowButton = false, ...rest } = props;

  return (
    <IconButton
      className={toolbarButton({ isOverflowButton, className })}
      {...rest}
      edge="start"
      size="small"
      ref={ref}
    >
      {Icon}
    </IconButton>
  );
});

export default ToolbarButton;
