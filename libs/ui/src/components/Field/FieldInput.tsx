import type { ComponentProps, ReactElement } from 'react';

type SwitchInputProps = {
  variant: 'switch';
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'default' | 'small';
};

type NativeInputProps = ComponentProps<'input'> & { variant?: never };

export type FieldInputProps = SwitchInputProps | NativeInputProps;

const FieldInput = (props: FieldInputProps): ReactElement => {
  if (props.variant === 'switch') {
    const { id, checked, onChange, disabled, size = 'default' } = props;
    const switchSizeClassName =
      size === 'small'
        ? 'h-5 w-9 after:left-0.5 after:top-0.5 after:h-4 after:w-4 peer-checked:after:translate-x-4'
        : 'h-6 w-11 after:left-0.5 after:top-0.5 after:h-5 after:w-5 peer-checked:after:translate-x-5';

    return (
      <label htmlFor={id} className="relative inline-flex cursor-pointer items-center">
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={() => onChange(!checked)}
        />
        <span
          className={[
            "rounded-full bg-vera-border transition-colors after:absolute after:rounded-full after:bg-vera-surface after:transition-transform after:content-[''] peer-checked:bg-vera-primary",
            switchSizeClassName,
          ].join(' ')}
        />
      </label>
    );
  }

  const { variant: _variant, ...inputProps } = props;

  return <input {...inputProps} />;
};

export default FieldInput;
