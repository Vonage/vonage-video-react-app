import type { ReactElement } from 'react';
import Field from '../Field';

export type SwitchFieldProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
};

const SwitchField = ({
  id,
  label,
  checked,
  onChange,
  description,
}: SwitchFieldProps): ReactElement => {
  return (
    <Field>
      <Field.Row>
        <Field.Label htmlFor={id}>{label}</Field.Label>
        <Field.Input id={id} variant="switch" checked={checked} onChange={onChange} />
      </Field.Row>
      {description ? <Field.Description>{description}</Field.Description> : null}
    </Field>
  );
};

export default SwitchField;
