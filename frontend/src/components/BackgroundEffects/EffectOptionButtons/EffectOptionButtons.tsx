import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import VividIcon from '@ui/VividIcon';
import SelectableOption from '../SelectableOption';
import AddBackgroundEffectLayout from '../AddBackgroundEffect/AddBackgroundEffectLayout/AddBackgroundEffectLayout';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';

/**
 * Renders a group of selectable buttons for background effects in a room.
 *
 * Each button represents a different background effect option.
 * @returns {ReactElement} A horizontal stack of selectable option buttons.
 */
const EffectOptionButtons = (): ReactElement => {
  const { backgroundSelected, handleBackgroundChange, handleAddCustomImage } =
    useBackgroundPublisherContext();
  const { t } = useTranslation();
  const options = [
    {
      key: 'none',
      icon: <VividIcon name="remove-line" customSize={-2} />,
      name: t('backgroundEffects.removeBackground'),
    },
    {
      key: 'low-blur',
      icon: <VividIcon name="blur-solid" customSize={-5} />,
      name: t('backgroundEffects.slightBlur'),
    },
    {
      key: 'high-blur',
      icon: <VividIcon name="blur-line" customSize={-2} />,
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
          onClick={() => {
            handleBackgroundChange(key);
          }}
          icon={icon}
        />
      ))}
      <AddBackgroundEffectLayout
        customBackgroundImageChange={handleAddCustomImage}
        backgroundSelected={backgroundSelected}
      />
    </>
  );
};

export default EffectOptionButtons;
