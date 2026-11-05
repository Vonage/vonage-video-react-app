import { tv } from 'tailwind-variants';

const meetingTimerVariants = tv(
  {
    base: 'flex shrink-0 items-center whitespace-nowrap rounded-full bg-vera-warning font-vera-plain text-vera-on-warning tabular-nums',
    variants: {
      isCompact: {
        true: 'h-8 gap-1.5 px-3 text-vera-caption-semibold',
        false: 'h-12 gap-2 px-4 text-vera-body-base-semibold',
      },
    },
  },
  { twMerge: false }
);

export default meetingTimerVariants;
