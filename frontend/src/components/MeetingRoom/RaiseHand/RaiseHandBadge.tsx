import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';
import VividIcon from '@ui/components/VividIcon';

export type RaiseHandBadgeProps = {
  /** Visual label for assistive technology. */
  ariaLabel?: string;
} & ComponentProps<'div'>;

/**
 * RaiseHandBadge — a hand-raise icon designed to overlay a video tile.
 *
 * Visibility is controlled entirely by the parent (AGENTS.md: no conditional
 * null returns in reusable components). The parent should only render this
 * component when a participant's hand is raised.
 * @param props - Component props.
 * @param props.className - Additional Tailwind classes for the root element.
 * @param props.ariaLabel - Accessible label for screen readers.
 * @returns The badge element.
 */
const RaiseHandBadge = ({ className, ariaLabel = 'Hand raised', ...rest }: RaiseHandBadgeProps) => {
  return (
    <div
      className={twMerge(
        'absolute top-2.5 left-2.5 z-10 flex h-6 w-6 items-center justify-center',
        className
      )}
      aria-label={ariaLabel}
      {...rest}
    >
      <VividIcon name="hand-solid" customSize={-4} className="text-vera-accent" />
    </div>
  );
};

export default RaiseHandBadge;
