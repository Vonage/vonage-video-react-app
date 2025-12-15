import { Publisher } from '@vonage/client-sdk-video';
import { ReactElement, useState } from 'react';
import Box from '@ui/Box';
import useTheme from '@ui/theme';
import EffectOptionButtons from '../EffectOptionButtons/EffectOptionButtons';
import BackgroundGallery from '../BackgroundGallery/BackgroundGallery';
import { DEFAULT_SELECTABLE_OPTION_WIDTH } from '@utils/constants';
import getInitialBackgroundFilter from '@utils/backgroundFilter/getInitialBackgroundFilter/getInitialBackgroundFilter';
import useImageStorage, { StoredImage } from '@utils/useImageStorage/useImageStorage';

type BackgroundEffectOptionsProps = {
  mode: 'meeting' | 'waiting';
  backgroundSelected: string;
  setBackgroundSelected: (value: string) => void;
  cleanupSelectedBackgroundReplacement: (dataUrl: string) => void;
  customBackgroundImageChange: (dataUrl: string) => void;
};

export const clearBgWhenSelectedDeleted = (
  publisher: Publisher | null | undefined,
  changeBackground: (bg: string) => void,
  backgroundSelected: string,
  dataUrl: string
) => {
  const selectedBackgroundOption = getInitialBackgroundFilter(publisher);
  if (dataUrl === selectedBackgroundOption) {
    changeBackground(backgroundSelected);
  }
};

/**
 * BackgroundEffectOptions Component
 *
 * This component manages the tabs for background effects, including selecting existing backgrounds
 * and adding new ones.
 * @param {BackgroundEffectOptionsProps} props - The props for the component.
 *   @property {string} mode - The mode of the background effect ('meeting' or 'waiting').
 *   @property {string} backgroundSelected - The currently selected background option.
 *   @property {Function} setBackgroundSelected - Function to set the selected background option.
 *   @property {Function} cleanupSelectedBackgroundReplacement - Function to clean up background replacement if deleted.
 *   @property {Function} customBackgroundImageChange - Callback function to handle background image change.
 * @returns {ReactElement} The background effect tabs component.
 */
const BackgroundEffectOptions = ({
  mode,
  backgroundSelected,
  setBackgroundSelected,
  cleanupSelectedBackgroundReplacement,
  customBackgroundImageChange,
}: BackgroundEffectOptionsProps): ReactElement => {
  const { getImagesFromStorage, deleteImageFromStorage } = useImageStorage();
  const [customImages, setCustomImages] = useState<StoredImage[]>(() => getImagesFromStorage());

  const handleBackgroundSelect = (value: string) => {
    setBackgroundSelected(value);
  };

  const handleCustomBackgroundImageChange = (dataUrl: string) => {
    customBackgroundImageChange(dataUrl);
    setCustomImages(getImagesFromStorage());
  };

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
            setBackgroundSelected={handleBackgroundSelect}
            customBackgroundImageChange={handleCustomBackgroundImageChange}
          />
          <BackgroundGallery
            backgroundSelected={backgroundSelected}
            setBackgroundSelected={handleBackgroundSelect}
            clearPublisherBgIfSelectedDeleted={cleanupSelectedBackgroundReplacement}
            customImages={customImages}
            setCustomImages={setCustomImages}
            deleteImageFromStorage={deleteImageFromStorage}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default BackgroundEffectOptions;
