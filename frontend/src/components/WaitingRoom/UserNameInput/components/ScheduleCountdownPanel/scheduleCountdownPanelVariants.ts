import { tv } from 'tailwind-variants';

const scheduleCountdownPanelVariants = tv(
  {
    slots: {
      panel: 'flex w-full gap-4',
      column: 'flex min-w-0 flex-1 flex-col gap-1 break-words',
      divider: 'w-px shrink-0 self-stretch bg-vera-border',
      label: 'font-vera-plain text-vera-caption-semibold uppercase text-vera-text-tertiary',
      countdown: 'font-vera-plain text-vera-heading-3 tabular-nums',
      headline: 'font-vera-plain text-vera-body-base-semibold',
      startTime: 'font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary',
      endTime: 'font-vera-plain text-vera-caption text-vera-text-tertiary',
    },
    variants: {
      isStarted: {
        true: { headline: 'text-vera-success' },
        false: { headline: 'text-vera-text-tertiary' },
      },
      isImminent: {
        true: { countdown: 'text-vera-text-primary' },
        false: { countdown: 'text-vera-text-secondary' },
      },
    },
  },
  { twMerge: false }
);

export default scheduleCountdownPanelVariants;
