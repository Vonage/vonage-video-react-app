import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import VividIcon from '@ui/components/VividIcon';
import disabledButtonClassName from '../../../constants/disabledButtonClassName';
import meetingExtension$ from '../../context/meetingExtensionContext';
import useExtensionCopy from '../../hooks/useExtensionCopy';

/**
 * Extension variant A: a notification-style card above the toolbar, one button per option.
 */
const ExtensionToast = (): ReactElement => {
  const { t } = useTranslation();
  const { countdown, optionCopies, usedLabel, hasExtensions } = useExtensionCopy();
  const { extend, setOpen } = meetingExtension$.use.actions();

  return (
    <div
      role="dialog"
      aria-label={t('meetingFlow.extension.extendMeeting')}
      className="absolute bottom-24 right-4 flex w-90 flex-col gap-4 rounded-lg border border-vera-border bg-vera-surface p-4 shadow-md max-sm:inset-x-4 max-sm:w-auto"
    >
      <div className="flex items-start gap-3">
        <VividIcon
          name="add-time-line"
          customSize={-4}
          style={{ color: 'var(--vera-text-primary)', flexShrink: 0 }}
        />
        <div className="flex flex-1 flex-col">
          <span className="font-vera-plain text-vera-body-base-semibold tabular-nums text-vera-text-secondary">
            {t('meetingFlow.extension.endsIn', { countdown })}
          </span>
          <span className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
            {t('meetingFlow.extension.prompt')}
          </span>
        </div>
        <IconButton
          size="small"
          aria-label={t('meetingFlow.common.notNow')}
          onClick={() => setOpen(false)}
        >
          <VividIcon name="close-line" customSize={-5} />
        </IconButton>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {optionCopies.map(({ minutes, isAvailable, label, resultLabel }) => (
          <div key={minutes} className="flex flex-col items-center gap-1">
            <Button
              variant="outlined"
              size="small"
              fullWidth
              disabled={!isAvailable}
              className={disabledButtonClassName}
              onClick={() => extend(minutes)}
            >
              {label}
            </Button>
            <span className="text-center font-vera-plain text-vera-caption text-vera-text-tertiary">
              {resultLabel}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-vera-border pt-3">
        <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
          {hasExtensions ? usedLabel : ''}
        </span>
        <Button variant="text" size="small" onClick={() => setOpen(false)}>
          {t('meetingFlow.common.notNow')}
        </Button>
      </div>
    </div>
  );
};

export default ExtensionToast;
