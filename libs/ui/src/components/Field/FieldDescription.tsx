import classNames from 'classnames';
import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';

type FieldDescriptionProps = ComponentProps<'p'>;

const FieldDescription: FC<FieldDescriptionProps> = ({ className, ...props }) => {
  return (
    <p
      className={twMerge(
        classNames('font-vera-plain text-vera-body-base text-vera-tertiary', className)
      )}
      {...props}
    />
  );
};

export default FieldDescription;
