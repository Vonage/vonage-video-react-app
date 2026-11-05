import type { ComponentProps, ReactElement } from 'react';
import { tv } from 'tailwind-variants';

export type SegmentedTabProps = ComponentProps<'button'> & {
  isSelected: boolean;
};

const segmentedTab = tv(
  {
    base: 'flex flex-1 shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2 font-vera-plain text-vera-body-base-semibold transition-colors',
    variants: {
      isSelected: {
        true: 'bg-vera-surface text-vera-text-secondary',
        false:
          'bg-transparent text-vera-text-tertiary hover:bg-vera-surface hover:text-vera-text-secondary',
      },
    },
  },
  { twMerge: false }
);

/**
 * Tab button with the same look as the Advanced settings sidebar tabs. Place it inside a `bg-vera-background` track.
 */
const SegmentedTab = ({ isSelected, className, ...props }: SegmentedTabProps): ReactElement => {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      className={segmentedTab({ isSelected, className })}
      {...props}
    />
  );
};

export default SegmentedTab;
