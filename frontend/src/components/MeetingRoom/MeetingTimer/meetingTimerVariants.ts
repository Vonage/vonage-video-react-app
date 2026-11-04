import { tv } from 'tailwind-variants';

const meetingTimerVariants = tv(
  {
    base: 'flex shrink-0 items-center whitespace-nowrap rounded-full font-vera-plain tabular-nums',
    variants: {
      isEndingSoon: {
        true: 'bg-vera-warning text-vera-on-warning',
        false: 'bg-vera-dark-grey text-vera-on-dark-grey',
      },
      isCompact: {
        true: 'h-8 gap-1.5 px-3 text-vera-caption-semibold',
        false: 'h-12 gap-2 px-4 text-vera-body-base-semibold',
      },
    },
  },
  { twMerge: false }
);

export default meetingTimerVariants;
