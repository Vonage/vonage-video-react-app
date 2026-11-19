import type { ReactElement } from 'react';
import ChoiceChip from '../../../components/ChoiceChip';
import useMeetingTabCopy from '../../hooks/useMeetingTabCopy';

export type DurationChoicesProps = {
  selectedMinutes: number | null;
  onSelect: (minutes: number) => void;
};

/**
 * The 20, 40 and 60 minute chips; a choice that would pass the 2 h cap is disabled.
 */
const DurationChoices = ({ selectedMinutes, onSelect }: DurationChoicesProps): ReactElement => {
  const { durationChoices } = useMeetingTabCopy();

  return (
    <div role="group" className="flex flex-wrap gap-3">
      {durationChoices.map(({ minutes, label, isAvailable }) => (
        <ChoiceChip
          key={minutes}
          isSelected={minutes === selectedMinutes}
          disabled={!isAvailable}
          onClick={() => onSelect(minutes)}
        >
          {label}
        </ChoiceChip>
      ))}
    </div>
  );
};

export default DurationChoices;
