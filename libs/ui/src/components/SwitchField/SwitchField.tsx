import type { CSSProperties, ReactElement } from 'react';
import Field from '../Field';

export type SwitchFieldProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  size?: 'default' | 'small';
  labelClassName?: string;
  labelStyle?: CSSProperties;
};

const SwitchField = ({
  id,
  label,
  checked,
  onChange,
  description,
  size,
  labelClassName,
  labelStyle,
}: SwitchFieldProps): ReactElement => {
  return (
    <Field>
      <Field.Row>
        <Field.Label htmlFor={id} className={labelClassName} style={labelStyle}>
          {label}
        </Field.Label>
        <Field.Input id={id} variant="switch" checked={checked} onChange={onChange} size={size} />
      </Field.Row>
      {description ? <Field.Description>{description}</Field.Description> : null}
    </Field>
  );
};

export default SwitchField;
