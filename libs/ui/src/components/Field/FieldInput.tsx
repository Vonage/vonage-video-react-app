import classNames from 'classnames';
import type { ComponentProps, ReactElement } from 'react';

type BaseProps = ComponentProps<'input'>;

type InputProps = BaseProps & {
  variant?: 'input';
};

type SwitchInputProps = Omit<BaseProps, 'size' | 'type'> & {
  variant: 'switch';
  size?: 'default' | 'small';
};

export type FieldInputProps = SwitchInputProps | InputProps;

const FieldInput = ({ className, ...props }: FieldInputProps): ReactElement => {
  if (props.variant === 'switch') {
    const { variant: _variant, size, onChange, ...inputProps } = props;

    return (
      <input
        {...inputProps}
        type="checkbox"
        onChange={onChange}
        className={classNames(
          'appearance-none rounded-full bg-vera-border bg-no-repeat transition-[background-color,background-position]',
          'cursor-pointer checked:bg-vera-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          {
            ['h-5 w-9 bg-[radial-gradient(circle_at_center,var(--vera-surface)_0_7.5px,transparent_8.5px)] ' +
            'bg-size-[18px_18px] bg-position-[1px_center] ' +
            'checked:bg-position-[17px_center]']: size === 'small',

            ['h-6 w-11 bg-[radial-gradient(circle_at_center,var(--vera-surface)_0_9.5px,transparent_10.5px)] ' +
            'bg-size-[22px_22px] bg-position-[1px_center] ' +
            'checked:bg-position-[21px_center]']: size !== 'small',
          },
          className
        )}
      />
    );
  }

  return <input className={className} {...props} />;
};

export default FieldInput;
