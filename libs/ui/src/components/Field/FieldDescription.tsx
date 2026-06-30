import type { ComponentProps, PropsWithChildren, ReactElement } from 'react';

const FieldDescription = ({
  children,
  className,
  ...props
}: PropsWithChildren<ComponentProps<'p'>>): ReactElement => {
  return (
    <p
      className={['font-vera-plain text-vera-body-base text-vera-tertiary', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </p>
  );
};

export default FieldDescription;
