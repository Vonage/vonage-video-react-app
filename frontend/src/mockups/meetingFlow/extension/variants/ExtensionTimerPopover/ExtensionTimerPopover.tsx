import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import classNames from 'classnames';
import Notice from '../../../components/Notice';
import disabledButtonClassName from '../../../constants/disabledButtonClassName';
import meetingExtension$ from '../../context/meetingExtensionContext';
import useExtensionCopy from '../../hooks/useExtensionCopy';

/**
 * Extension variant C: a popover above the toolbar timer; each option shows the end time it leads to.
 */
const ExtensionTimerPopover = (): ReactElement => {
  const { t } = useTranslation();
  const { endsAtLabel, optionCopies, usedLabel, isAtCap, atCapLabel, hasExtensions } =
    useExtensionCopy();
  const { extend, setOpen } = meetingExtension$.use.actions();
  const firstAvailable = optionCopies.find(({ isAvailable }) => isAvailable)?.minutes ?? null;
  const [selectedMinutes, setSelectedMinutes] = useState(firstAvailable);

  return (
    <div
      role="dialog"
      aria-label={t('meetingFlow.extension.extendMeeting')}
      className="absolute bottom-24 left-1/2 flex w-80 -translate-x-1/2 flex-col gap-4 rounded-vera-large border border-vera-border bg-vera-surface p-4 shadow-md max-sm:inset-x-4 max-sm:w-auto max-sm:translate-x-0"
    >
      <div className="flex flex-col">
        <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
          {t('meetingFlow.extension.extendMeeting')}
        </span>
        <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
          {t('meetingFlow.extension.endsAt', { time: endsAtLabel })}
        </span>
      </div>
      {isAtCap ? (
        <Notice tone="information">{atCapLabel}</Notice>
      ) : (
        <div role="radiogroup" className="flex flex-col gap-1">
          {optionCopies.map(({ minutes, isAvailable, label, resultLabel }) => {
            const isSelected = minutes === selectedMinutes;

            return (
              <label
                key={minutes}
                className={classNames(
                  'flex items-center gap-3 rounded-vera-medium border px-3 py-2',
                  {
                    'cursor-pointer border-vera-primary bg-vera-background': isSelected,
                    'cursor-pointer border-vera-border': !isSelected && isAvailable,
                    'cursor-not-allowed border-vera-border opacity-50': !isAvailable,
                  }
                )}
              >
                <input
                  type="radio"
                  name="mockup-extension-option"
                  className="accent-vera-primary"
                  checked={isSelected}
                  disabled={!isAvailable}
                  onChange={() => setSelectedMinutes(minutes)}
                />
                <span className="flex-1 font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
                  {label}
                </span>
                <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
                  {resultLabel}
                </span>
              </label>
            );
          })}
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
          {hasExtensions ? usedLabel : ''}
        </span>
        <div className="flex gap-2">
          <Button variant="text" size="small" onClick={() => setOpen(false)}>
            {t('meetingFlow.common.notNow')}
          </Button>
          {!isAtCap && (
            <Button
              variant="contained"
              size="small"
              disabled={selectedMinutes === null}
              className={disabledButtonClassName}
              onClick={() => selectedMinutes !== null && extend(selectedMinutes)}
            >
              {t('meetingFlow.extension.extend')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtensionTimerPopover;
