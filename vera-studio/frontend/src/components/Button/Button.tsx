import { isPromise } from '@common/assertions';
import { type ComponentProps, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { tv, type VariantProps } from 'tailwind-variants';

const buttonStyles = tv({
  base: 'px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 inline-flex items-center gap-1.5',
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

type AsyncMouseEventHandler = (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;

type ButtonProps = Omit<ComponentProps<'button'>, 'onClick'> &
  VariantProps<typeof buttonStyles> & {
    onClick?: AsyncMouseEventHandler;
  };

const Button = ({
  type,
  variant,
  className,
  onClick,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;

    const result = onClick(event);

    if (isPromise(result)) {
      setIsPending(true);

      try {
        await result;
      } finally {
        setIsPending(false);
      }
    }
  };

  const isDisabled = disabled || isPending;

  return (
    <button
      type={type ?? 'button'}
      className={twMerge(buttonStyles({ variant }), className)}
      onClick={handleClick}
      disabled={isDisabled}
      {...props}
    >
      {isPending && (
        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
