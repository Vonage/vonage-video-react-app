import type { ReactElement } from 'react';

export type SwitchFieldProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
};

const SwitchField = ({ label, checked, onChange, description }: SwitchFieldProps): ReactElement => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-vera-plain text-vera-body-extended-semibold text-vera-secondary">
          {label}
        </h3>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            aria-label={label}
            checked={checked}
            onChange={(event) => {
              onChange(event.target.checked);
            }}
          />
          <span className="h-6 w-11 rounded-full bg-vera-border transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-vera-surface after:transition-transform after:content-[''] peer-checked:bg-vera-primary peer-checked:after:translate-x-5" />
        </label>
      </div>
      {description ? (
        <p className="font-vera-plain text-vera-body-base text-vera-tertiary">{description}</p>
      ) : null}
    </div>
  );
};

export default SwitchField;
