import classNames from 'classnames';
import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { tv, type VariantProps } from 'tailwind-variants';

type SeparatorProps = ComponentProps<'div'> & VariantProps<typeof separator>;

const separator = tv({
  base: 'Separator border-slate-200',
  variants: {
    orientation: {
      horizontal: 'border-t',
      vertical: 'border-l h-full',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

const Separator: FC<SeparatorProps> = ({ className, orientation, ...props }) => {
  return <div className={twMerge(classNames(separator({ orientation }), className))} {...props} />;
};

export default Separator;
