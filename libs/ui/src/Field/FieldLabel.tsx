import type { ComponentProps, PropsWithChildren, ReactElement } from 'react';

const FieldLabel = ({
  children,
  className,
  ...props
}: PropsWithChildren<ComponentProps<'label'>>): ReactElement => {
  return (
    <label
      className={['font-vera-plain text-vera-body-extended-semibold text-vera-secondary', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </label>
  );
};

export default FieldLabel;
