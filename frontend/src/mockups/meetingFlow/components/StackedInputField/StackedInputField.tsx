import type { ComponentProps, ReactElement } from 'react';
import classNames from 'classnames';

export type StackedInputFieldProps = ComponentProps<'input'> & {
  id: string;
  label: string;
  description?: string;
};

/**
 * Text, date or time input with its label above, matching the library SelectField.
 */
const StackedInputField = ({
  id,
  label,
  description,
  className,
  ...inputProps
}: StackedInputFieldProps): ReactElement => {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary"
      >
        {label}
      </label>
      <input
        id={id}
        className={classNames(
          'w-full rounded-vera-medium border border-vera-border bg-vera-surface px-3 py-2 font-vera-plain text-vera-body-base text-vera-text-secondary outline-none transition-colors scheme-light focus:border-vera-primary dark:scheme-dark',
          className
        )}
        {...inputProps}
      />
      {description && (
        <p className="font-vera-plain text-vera-body-base text-vera-text-tertiary">{description}</p>
      )}
    </div>
  );
};

export default StackedInputField;
