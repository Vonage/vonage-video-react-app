import React, { ReactElement } from 'react';
import BlockIcon from '@mui/icons-material/Block';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import SelectableOption from '../SelectableOption';

const options = [
  { key: 'none', icon: <BlockIcon sx={{ fontSize: '30px' }} /> },
  { key: 'low-blur', icon: <BlurOnIcon /> },
  { key: 'high-blur', icon: <BlurOnIcon sx={{ fontSize: '30px' }} /> },
];

interface EffectOptionButtonsProps {
  backgroundSelected: string;
  setBackgroundSelected: (key: string) => void;
}

/**
 * Renders a group of selectable buttons for background effects in a room.
 *
 * Each button represents a different background effect option.
 * @param {EffectOptionButtonsProps} props - the props for the component.
 *   @property {boolean} backgroundSelected - The currently selected background effect key.
 *   @property {Function} setBackgroundSelected - Callback to update the selected background effect key.
 * @returns {ReactElement} A horizontal stack of selectable option buttons.
 */
const EffectOptionButtons: React.FC<EffectOptionButtonsProps> = ({
  backgroundSelected,
  setBackgroundSelected,
}): ReactElement => {
  return (
    <>
      {options.map(({ key, icon }) => (
        <SelectableOption
          key={key}
          id={key}
          selected={backgroundSelected === key}
          onClick={() => setBackgroundSelected(key)}
          icon={icon}
        />
      ))}
    </>
  );
};

export default EffectOptionButtons;
