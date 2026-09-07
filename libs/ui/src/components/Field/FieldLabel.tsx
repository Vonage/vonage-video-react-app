import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';

type FieldLabelProps = ComponentProps<'label'>;

const FieldLabel: FC<FieldLabelProps> = ({ className, ...props }) => {
  return (
    <label
      className={twMerge(
        'font-vera-plain text-vera-body-extended-semibold! text-vera-secondary',
        className
      )}
      {...props}
    />
  );
};

export default FieldLabel;
