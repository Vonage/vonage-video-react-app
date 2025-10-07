import { ReactElement } from 'react';
import BlockIcon from '@mui/icons-material/Block';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import { useTranslation } from 'react-i18next';
import SelectableOption from '../SelectableOption';

export type EffectOptionButtonsProps = {
  backgroundSelected: string;
  setBackgroundSelected: (key: string) => void;
};

/**
 * Renders a group of selectable buttons for background effects in a room.
 *
 * Each button represents a different background effect option.
 * @param {EffectOptionButtonsProps} props - the props for the component.
 *   @property {boolean} backgroundSelected - The currently selected background effect key.
 *   @property {Function} setBackgroundSelected - Callback to update the selected background effect key.
 * @returns {ReactElement} A horizontal stack of selectable option buttons.
 */
const EffectOptionButtons = ({
  backgroundSelected,
  setBackgroundSelected,
}: EffectOptionButtonsProps): ReactElement => {
  const { t } = useTranslation();
  const options = [
    {
      key: 'none',
      icon: <BlockIcon sx={{ fontSize: '30px' }} />,
      name: t('backgroundEffects.removeBackground'),
    },
    { key: 'low-blur', icon: <BlurOnIcon />, name: t('backgroundEffects.slightBlur') },
    {
      key: 'high-blur',
      icon: <BlurOnIcon sx={{ fontSize: '30px' }} />,
      name: t('backgroundEffects.strongBlur'),
    },
  ];
  return (
    <>
      {options.map(({ key, icon, name }) => (
        <SelectableOption
          key={key}
          id={key}
          title={name}
          isSelected={backgroundSelected === key}
          onClick={() => setBackgroundSelected(key)}
          icon={icon}
        />
      ))}
    </>
  );
};

export default EffectOptionButtons;
