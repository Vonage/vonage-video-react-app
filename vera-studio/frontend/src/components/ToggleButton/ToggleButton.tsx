import type { ComponentProps } from 'react';

type ToggleButtonProps = ComponentProps<'button'> & {
  isActive: boolean;
};

const ToggleButton = ({ isActive, className, children, ...props }: ToggleButtonProps) => (
  <button
    {...props}
    className={[
      'cursor-pointer rounded-lg border px-2.5 py-1.5 text-sm transition-colors',
      isActive ? 'font-bold' : 'font-medium',
      className ?? '',
    ].join(' ')}
  >
    {children}
  </button>
);

export default ToggleButton;
