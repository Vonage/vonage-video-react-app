import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import VividIcon from '@ui/components/VividIcon';
import ChoiceChip from '../../../components/ChoiceChip';
import meetingExtension$ from '../../context/meetingExtensionContext';
import useExtensionCopy from '../../hooks/useExtensionCopy';

/**
 * Extension variant B: a slim bar at the top of the video canvas with the options inline.
 */
const ExtensionBanner = (): ReactElement => {
  const { t } = useTranslation();
  const { countdown, optionCopies, usedLabel, hasExtensions } = useExtensionCopy();
  const { extend, setOpen } = meetingExtension$.use.actions();

  return (
    <div className="absolute inset-x-4 top-6 flex justify-center">
      <div
        role="dialog"
        aria-label={t('meetingFlow.extension.extendMeeting')}
        className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-vera-extra-large border border-vera-border bg-vera-surface py-2 pl-5 pr-2 shadow-md max-sm:rounded-vera-large max-sm:py-3"
      >
        <span className="flex items-center gap-2">
          <VividIcon name="alarm-line" customSize={-5} style={{ color: 'var(--vera-warning)' }} />
          <span className="font-vera-plain text-vera-body-base-semibold tabular-nums text-vera-text-secondary">
            {t('meetingFlow.extension.endsIn', { countdown })}
          </span>
        </span>
        <span className="h-6 w-px bg-vera-border max-sm:hidden" />
        <span className="flex items-center gap-2">
          <span className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
            {t('meetingFlow.extension.extend')}
          </span>
          {optionCopies.map(({ minutes, isAvailable, label, resultLabel }) => (
            <ChoiceChip
              key={minutes}
              isSelected={false}
              disabled={!isAvailable}
              title={resultLabel}
              onClick={() => extend(minutes)}
            >
              {label}
            </ChoiceChip>
          ))}
        </span>
        {hasExtensions && (
          <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
            {usedLabel}
          </span>
        )}
        <IconButton
          size="small"
          aria-label={t('meetingFlow.common.notNow')}
          onClick={() => setOpen(false)}
        >
          <VividIcon name="close-line" customSize={-5} />
        </IconButton>
      </div>
    </div>
  );
};

export default ExtensionBanner;
