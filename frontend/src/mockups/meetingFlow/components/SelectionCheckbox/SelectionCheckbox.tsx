import type { ComponentProps, ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Native checkbox tinted with the primary color.
 */
const SelectionCheckbox = ({
  className,
  ...props
}: Omit<ComponentProps<'input'>, 'type'>): ReactElement => {
  return (
    <input
      type="checkbox"
      className={twMerge('size-4 shrink-0 cursor-pointer accent-vera-primary', className)}
      {...props}
    />
  );
};

export default SelectionCheckbox;
