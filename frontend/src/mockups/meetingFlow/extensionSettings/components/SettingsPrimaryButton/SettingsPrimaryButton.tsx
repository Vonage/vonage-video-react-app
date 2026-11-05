import type { ComponentProps, ReactElement } from 'react';
import classNames from 'classnames';

/**
 * The primary button of the Settings General tab, with disabled tokens added.
 */
const SettingsPrimaryButton = ({ className, ...props }: ComponentProps<'button'>): ReactElement => {
  return (
    <button
      type="button"
      className={classNames(
        'w-fit cursor-pointer rounded-vera-medium bg-vera-primary px-4 py-2 font-vera-plain text-vera-body-base-semibold text-vera-surface transition-opacity hover:opacity-90',
        'disabled:cursor-not-allowed disabled:bg-vera-disabled disabled:text-vera-text-disabled disabled:hover:opacity-100',
        className
      )}
      {...props}
    />
  );
};

export default SettingsPrimaryButton;
