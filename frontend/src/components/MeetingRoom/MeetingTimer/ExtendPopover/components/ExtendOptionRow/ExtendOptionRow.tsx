import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { getFormattedTime } from '@utils/dateTime';
import type { ExtensionOption } from '../../helpers/getExtensionOptions';
import extendOptionRowVariants from './extendOptionRowVariants';

export type ExtendOptionRowProps = {
  option: ExtensionOption;
  isSelected: boolean;
  endsAt: number;
  maxTotalMinutes: number;
  onSelect: (minutes: number) => void;
};

/**
 * One extension option, with the end time it leads to or why it is not available.
 */
const ExtendOptionRow = ({
  option: { minutes, isAvailable },
  isSelected,
  endsAt,
  maxTotalMinutes,
  onSelect,
}: ExtendOptionRowProps): ReactElement => {
  const { t, i18n } = useTranslation();

  const resultLabel = (() => {
    if (!isAvailable) return t('meetingExtension.overLimit', { minutes: maxTotalMinutes });
    return t('meetingExtension.endsAt', {
      time: getFormattedTime(i18n.language, endsAt + minutes * 60_000),
    });
  })();

  return (
    <label className={extendOptionRowVariants({ isSelected, isAvailable })}>
      <input
        type="radio"
        name="meeting-extension-option"
        className="accent-vera-primary"
        checked={isSelected}
        disabled={!isAvailable}
        onChange={() => onSelect(minutes)}
      />
      <span className="flex-1 font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
        {t('meetingExtension.option', { minutes })}
      </span>
      <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
        {resultLabel}
      </span>
    </label>
  );
};

export default ExtendOptionRow;
