import type { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';
import { tv, type VariantProps } from 'tailwind-variants';

const buttonStyles = tv({
  base: 'px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-70',
  variants: {
    variant: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonStyles>;

const Button = ({ type, variant, className, ...props }: ButtonProps) => {
  return (
    <button
      type={type ?? 'button'}
      className={twMerge(buttonStyles({ variant }), className)}
      {...props}
    />
  );
};

export default Button;
