import type { CSSProperties, ReactElement } from 'react';
import Field from '../Field';
import type { FieldInputProps } from '../Field';

type SwitchInputProps = Omit<Extract<FieldInputProps, { variant: 'switch' }>, 'variant'>;

export type SwitchFieldProps = SwitchInputProps & {
  label: string;
  description?: string;
  labelClassName?: string;
  labelStyle?: CSSProperties;
};

const SwitchField = ({
  label,
  description,
  labelClassName,
  labelStyle,
  ...inputProps
}: SwitchFieldProps): ReactElement => {
  return (
    <Field>
      <Field.Row>
        <Field.Label htmlFor={inputProps.id} className={labelClassName} style={labelStyle}>
          {label}
        </Field.Label>
        <Field.Input variant="switch" {...inputProps} />
      </Field.Row>
      {description ? <Field.Description>{description}</Field.Description> : null}
    </Field>
  );
};

export default SwitchField;
