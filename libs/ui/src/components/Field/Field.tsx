import type { ComponentProps, PropsWithChildren, ReactElement } from 'react';
import FieldDescription from './FieldDescription';
import FieldInput from './FieldInput';
import FieldLabel from './FieldLabel';
import FieldRow from './FieldRow';

const FieldRoot = ({
  children,
  className,
  ...props
}: PropsWithChildren<ComponentProps<'div'>>): ReactElement => {
  return (
    <div className={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
};

const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Input: FieldInput,
  Description: FieldDescription,
  Row: FieldRow,
});

export default Field;
