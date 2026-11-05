import type { ComponentProps, ReactElement } from 'react';
import classNames from 'classnames';

/**
 * The Settings primary button's shape as an outlined secondary action.
 */
const SettingsSecondaryButton = ({
  className,
  ...props
}: ComponentProps<'button'>): ReactElement => {
  return (
    <button
      type="button"
      className={classNames(
        'w-fit cursor-pointer rounded-vera-medium border border-vera-border bg-vera-surface px-4 py-2 font-vera-plain text-vera-body-base-semibold text-vera-text-secondary transition-colors hover:bg-vera-background',
        className
      )}
      {...props}
    />
  );
};

export default SettingsSecondaryButton;
