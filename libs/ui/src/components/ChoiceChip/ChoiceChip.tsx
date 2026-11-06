import type { ComponentProps, ReactElement } from 'react';
import { tv } from 'tailwind-variants';

export type ChoiceChipProps = ComponentProps<'button'> & {
  isSelected: boolean;
};

const choiceChipVariants = tv(
  {
    base: 'cursor-pointer rounded-full border px-4 py-1.5 font-vera-plain text-vera-body-base-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    variants: {
      isSelected: {
        true: 'border-vera-primary bg-vera-primary text-vera-on-primary',
        false:
          'border-vera-border bg-vera-surface text-vera-text-secondary hover:border-vera-primary',
      },
    },
  },
  { twMerge: false }
);

/**
 * Pill-shaped button for picking one choice out of a few.
 */
const ChoiceChip = ({ isSelected, className, ...props }: ChoiceChipProps): ReactElement => {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={choiceChipVariants({ isSelected, className })}
      {...props}
    />
  );
};

export default ChoiceChip;
