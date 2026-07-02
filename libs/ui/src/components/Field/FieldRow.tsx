import type { ComponentProps, PropsWithChildren, ReactElement } from 'react';

const FieldRow = ({
  children,
  className,
  ...props
}: PropsWithChildren<ComponentProps<'div'>>): ReactElement => {
  return (
    <div
      className={['flex items-center justify-between gap-4', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
};

export default FieldRow;
