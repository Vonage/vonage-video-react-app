import type { ComponentProps, ReactElement } from 'react';
import classNames from 'classnames';
import { twMerge } from 'tailwind-merge';

type SkeletonProps = Omit<ComponentProps<'span'>, 'children'> & {
  variant?: 'text' | 'rounded';
};

const Skeleton = ({ variant = 'text', className, ...props }: SkeletonProps): ReactElement => (
  <span
    aria-hidden="true"
    className={twMerge(
      classNames(
        'block animate-pulse motion-reduce:animate-none bg-vera-skeleton-like rounded-vera-medium',
        {
          'h-auto origin-[0_55%] scale-y-[0.6]': variant === 'text',
        }
      ),
      className
    )}
    {...props}
  >
    {variant === 'text' ? '\u00a0' : null}
  </span>
);

export default Skeleton;
