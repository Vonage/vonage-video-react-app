import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ChoiceChip from '@ui/components/ChoiceChip';
import type { ExtensionOption } from '../../helpers/getExtensionOptions';

export type ExtendDurationChoicesProps = {
  options: ExtensionOption[];
  selectedMinutes: number | null;
  onSelect: (minutes: number) => void;
};

/**
 * The extension durations as chips; a duration past the total cap is disabled.
 */
const ExtendDurationChoices = ({
  options,
  selectedMinutes,
  onSelect,
}: ExtendDurationChoicesProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t('meetingExtension.chooseDuration')}
      className="flex flex-wrap gap-3"
    >
      {options.map(({ minutes, isAvailable }) => (
        <ChoiceChip
          key={minutes}
          isSelected={minutes === selectedMinutes}
          disabled={!isAvailable}
          onClick={() => onSelect(minutes)}
        >
          {t('meetingExtension.minutes', { minutes })}
        </ChoiceChip>
      ))}
    </div>
  );
};

export default ExtendDurationChoices;
