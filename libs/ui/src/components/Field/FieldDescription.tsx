import classNames from 'classnames';
import type { ComponentProps, FC } from 'react';
import mergeFieldClasses from './mergeFieldClasses';

type FieldDescriptionProps = ComponentProps<'p'>;

const FieldDescription: FC<FieldDescriptionProps> = ({ className, ...props }) => {
  return (
    <p
      className={mergeFieldClasses(
        classNames('font-vera-plain text-vera-body-base text-vera-text-tertiary', className)
      )}
      {...props}
    />
  );
};

export default FieldDescription;
