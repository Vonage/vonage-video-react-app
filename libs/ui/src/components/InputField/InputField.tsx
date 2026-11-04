import type { ComponentProps, ReactElement } from 'react';
import classNames from 'classnames';

export type InputFieldProps = ComponentProps<'input'> & {
  id: string;
  label: string;
  description?: string;
  hasError?: boolean;
};

/**
 * Text, date or time input with its label above and an optional description below, matching `SelectField`.
 */
const InputField = ({
  id,
  label,
  description,
  hasError = false,
  className,
  ...inputProps
}: InputFieldProps): ReactElement => {
  const descriptionId = `${id}-description`;

  return (
    <div className={classNames('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={hasError}
        aria-describedby={description ? descriptionId : undefined}
        className={classNames(
          'w-full rounded-vera-medium border bg-vera-surface px-3 py-2 font-vera-plain text-vera-body-base text-vera-text-secondary outline-none transition-colors scheme-light dark:scheme-dark',
          {
            'border-vera-error': hasError,
            'border-vera-border focus:border-vera-primary': !hasError,
          }
        )}
        {...inputProps}
      />
      {description && (
        <p
          id={descriptionId}
          className={classNames('font-vera-plain text-vera-body-base', {
            'text-vera-error': hasError,
            'text-vera-text-tertiary': !hasError,
          })}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default InputField;
