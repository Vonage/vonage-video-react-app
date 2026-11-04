import { tv } from 'tailwind-variants';

const scheduleCountdownPanelVariants = tv(
  {
    slots: {
      panel: 'flex w-full flex-col gap-1 rounded-vera-large px-4 py-3',
      countdown: 'font-vera-plain text-vera-heading-3 tabular-nums',
      headline: 'font-vera-plain text-vera-body-base-semibold',
    },
    variants: {
      isStarted: {
        true: { panel: 'bg-vera-success/10', headline: 'text-vera-success' },
        false: { panel: 'bg-vera-background', headline: 'text-vera-text-tertiary' },
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
