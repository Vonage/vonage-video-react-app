import type { ChangeEvent, ComponentProps, ReactElement } from 'react';
import VividIcon from '../VividIcon';

export type SelectFieldOption<TValue extends string | number = string> = {
  value: TValue;
  label: string;
};

export type SelectFieldProps<TValue extends string | number = string> = Omit<
  ComponentProps<'select'>,
  'value' | 'onChange' | 'children'
> & {
  id: string;
  label: string;
  value: TValue;
  options: SelectFieldOption<TValue>[];
  onChange: (value: TValue) => void;
  description?: string;
};

const SelectField = <TValue extends string | number>({
  id,
  label,
  value,
  options,
  onChange,
  description,
  ...selectProps
}: SelectFieldProps<TValue>): ReactElement => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = options.find((option) => String(option.value) === event.target.value);

    if (!selectedOption) return;

    onChange(selectedOption.value);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-vera-plain text-vera-body-extended-semibold text-vera-secondary"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={handleChange}
          className="w-full appearance-none rounded-vera-medium border border-vera-border bg-vera-surface px-3 py-2 pr-10 font-vera-plain text-vera-body-base text-vera-secondary outline-none transition-colors focus:border-vera-primary"
          {...selectProps}
        >
          {options.map((option) => (
            <option key={String(option.value)} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <VividIcon
          name="chevron-down-line"
          customSize={-5}
          style={{
            color: 'var(--vera-text-tertiary)',
            pointerEvents: 'none',
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />
      </div>
      {description ? (
        <p className="font-vera-plain text-vera-body-base text-vera-tertiary">{description}</p>
      ) : null}
    </div>
  );
};

export default SelectField;
