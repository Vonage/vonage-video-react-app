import { useId } from 'react';
import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

export type AutoJoinCheckboxProps = ComponentProps<'div'> & {
  isChecked: boolean;
  isDisabled: boolean;
  onCheckedChange: (isChecked: boolean) => void;
};

/**
 * Opt-in to join a scheduled meeting automatically at its start; disabled until a valid name is entered.
 */
const AutoJoinCheckbox = ({
  isChecked,
  isDisabled,
  onCheckedChange,
  className,
  ...props
}: AutoJoinCheckboxProps): ReactElement => {
  const { t } = useTranslation();
  const nameHintId = useId();

  return (
    <div className={classNames('flex flex-col gap-0.5', className)} {...props}>
      <label
        className={classNames('flex items-center gap-2 font-vera-plain text-vera-body-base', {
          'cursor-pointer text-vera-text-secondary': !isDisabled,
          'cursor-not-allowed text-vera-text-disabled': isDisabled,
        })}
      >
        <input
          type="checkbox"
          checked={isChecked}
          disabled={isDisabled}
          aria-describedby={isDisabled ? nameHintId : undefined}
          onChange={(event) => onCheckedChange(event.currentTarget.checked)}
          className="size-4 shrink-0 cursor-pointer accent-vera-primary disabled:cursor-not-allowed"
        />
        {t('waitingRoom.schedule.autoJoin')}
      </label>

      {isDisabled && (
        <span
          id={nameHintId}
          className="pl-6 font-vera-plain text-vera-caption text-vera-text-tertiary"
        >
          {t('waitingRoom.schedule.autoJoinNameHint')}
        </span>
      )}
    </div>
  );
};

export default AutoJoinCheckbox;
