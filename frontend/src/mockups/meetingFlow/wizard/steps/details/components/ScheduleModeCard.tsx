import type { ComponentProps, ReactElement } from 'react';
import { tv } from 'tailwind-variants';
import VividIcon from '@ui/components/VividIcon';

type ScheduleModeCardProps = ComponentProps<'button'> & {
  isSelected: boolean;
  icon: string;
  title: string;
  description: string;
};

const scheduleModeCard = tv(
  {
    base: 'flex flex-1 cursor-pointer items-center gap-3 rounded-vera-large border-2 bg-vera-surface p-4 text-left transition-colors',
    variants: {
      isSelected: {
        true: 'border-vera-primary',
        false: 'border-vera-border hover:border-vera-primary',
      },
    },
  },
  { twMerge: false }
);

/**
 * Radio-style card used to pick "No schedule" or "Scheduled".
 */
const ScheduleModeCard = ({
  isSelected,
  icon,
  title,
  description,
  className,
  ...props
}: ScheduleModeCardProps): ReactElement => {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      className={scheduleModeCard({ isSelected, className })}
      {...props}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-vera-background">
        <VividIcon name={icon} customSize={-5} style={{ color: 'var(--vera-text-primary)' }} />
      </span>
      <span className="flex flex-col">
        <span className="font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
          {title}
        </span>
        <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
          {description}
        </span>
      </span>
    </button>
  );
};

export default ScheduleModeCard;
