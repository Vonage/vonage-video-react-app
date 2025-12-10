import { ReactElement } from 'react';
import Box from '@ui/Box';
import useTheme from '@ui/theme';
import EffectOptionButtons from '../EffectOptionButtons/EffectOptionButtons';
import BackgroundGallery from '../BackgroundGallery/BackgroundGallery';
import { DEFAULT_SELECTABLE_OPTION_WIDTH } from '@utils/constants';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';

type BackgroundEffectOptionsProps = {
  mode: 'meeting' | 'waiting';
};

/**
 * BackgroundEffectOptions Component
 *
 * This component manages the tabs for background effects, including selecting existing backgrounds
 * and adding new ones.
 * @param {BackgroundEffectOptionsProps} props - The props for the component.
 *   @property {string} mode - The mode of the background effect ('meeting' or 'waiting').
 * @returns {ReactElement} The background effect tabs component.
 */
const BackgroundEffectOptions = ({ mode }: BackgroundEffectOptionsProps): ReactElement => {
  const {
    backgroundSelected,
    customImages,
    deleteCustomImage,
    handleBackgroundChange,
    handleAddCustomImage,
  } = useBackgroundPublisherContext();

  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'block',
        flex: 1,
        minWidth: 0,
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        minHeight: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          maxHeight: '100%',
          overflow: 'hidden',
          borderRadius: theme.shapes.borderRadiusLarge,
          backgroundColor: theme.colors.surface,
          justifyContent: 'center',
          flex: 1,
          minWidth: 0,
        }}
      >
        <Box
          display="grid"
          gridTemplateColumns={`repeat(auto-fill, minmax(${DEFAULT_SELECTABLE_OPTION_WIDTH}px, 1fr))`}
          gap={0.5}
          className={
            mode === 'meeting'
              ? 'choose-background-effect-grid'
              : 'choose-background-effect-grid-waiting'
          }
        >
          <EffectOptionButtons
            backgroundSelected={backgroundSelected}
            setBackgroundSelected={handleBackgroundChange}
            customBackgroundImageChange={handleAddCustomImage}
          />
          <BackgroundGallery
            backgroundSelected={backgroundSelected}
            setBackgroundSelected={handleBackgroundChange}
            customImages={customImages}
            onDelete={deleteCustomImage}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default BackgroundEffectOptions;
