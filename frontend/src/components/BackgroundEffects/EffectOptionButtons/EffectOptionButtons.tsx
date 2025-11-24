import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import VividIcon from '@components/VividIcon';
import SelectableOption from '../SelectableOption';
import AddBackgroundEffectLayout from '../AddBackgroundEffect/AddBackgroundEffectLayout/AddBackgroundEffectLayout';

export type EffectOptionButtonsProps = {
  backgroundSelected: string;
  setBackgroundSelected: (key: string) => void;
  customBackgroundImageChange: (dataUrl: string) => void;
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
  customBackgroundImageChange,
}: EffectOptionButtonsProps): ReactElement => {
  const { t } = useTranslation();
  const options = [
    {
      key: 'none',
      icon: <VividIcon name="remove-line" customSize={-2} />,
      name: t('backgroundEffects.removeBackground'),
    },
    {
      key: 'low-blur',
      icon: <VividIcon name="blur-line" customSize={-2} />,
      name: t('backgroundEffects.slightBlur'),
    },
    {
      key: 'high-blur',
      icon: <VividIcon name="blur-solid" customSize={-5} />,
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
      <AddBackgroundEffectLayout
        customBackgroundImageChange={customBackgroundImageChange}
        backgroundSelected={backgroundSelected}
      />
    </>
  );
};

export default EffectOptionButtons;
