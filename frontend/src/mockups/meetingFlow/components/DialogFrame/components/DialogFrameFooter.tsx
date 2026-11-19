import type { ComponentProps, ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Bottom action bar of a DialogFrame; actions align to the end.
 */
const DialogFrameFooter = ({ className, ...props }: ComponentProps<'div'>): ReactElement => {
  return (
    <div
      className={twMerge(
        'flex flex-wrap items-center justify-end gap-3 border-t border-vera-border px-6 py-4',
        className
      )}
      {...props}
    />
  );
};

export default DialogFrameFooter;
