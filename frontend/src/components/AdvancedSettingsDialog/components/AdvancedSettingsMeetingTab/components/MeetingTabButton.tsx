import type { ComponentProps, ReactElement } from 'react';
import { tv } from 'tailwind-variants';

export type MeetingTabButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};

const meetingTabButtonVariants = tv(
  {
    base: 'w-fit cursor-pointer rounded-vera-medium px-4 py-2 font-vera-plain text-vera-body-base-semibold disabled:cursor-not-allowed',
    variants: {
      variant: {
        primary:
          'bg-vera-primary text-vera-surface transition-opacity hover:opacity-90 disabled:bg-vera-disabled disabled:text-vera-text-disabled disabled:hover:opacity-100',
        secondary:
          'border border-vera-border bg-vera-surface text-vera-text-secondary transition-colors hover:bg-vera-background',
      },
    },
  },
  { twMerge: false }
);

/**
 * The Settings General tab button, with a secondary outlined flavor and disabled colors.
 */
const MeetingTabButton = ({
  variant = 'primary',
  className,
  ...props
}: MeetingTabButtonProps): ReactElement => {
  return (
    <button type="button" className={meetingTabButtonVariants({ variant, className })} {...props} />
  );
};

export default MeetingTabButton;
