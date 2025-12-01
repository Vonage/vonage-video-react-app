import { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@ui/Box';
import Tooltip from '@ui/Tooltip';
import IconButton from '@ui/IconButton';
import VividIcon from '@components/VividIcon';
import useCustomTheme from '@Context/Theme';
import { BACKGROUNDS_PATH } from '../../../utils/constants';
import SelectableOption from '../SelectableOption';
import useImageStorage, { StoredImage } from '../../../utils/useImageStorage/useImageStorage';

export type BackgroundGalleryProps = {
  backgroundSelected: string;
  setBackgroundSelected: (dataUrl: string) => void;
  clearPublisherBgIfSelectedDeleted: (dataUrl: string) => void;
  refreshTrigger?: number;
};

/**
 * Renders a group of selectable images for background replacement in a meeting room.
 *
 * Each button represents a different background image option.
 * @param {BackgroundGalleryProps} props - The props for the component.
 *   @property {string} backgroundSelected - The currently selected background image key.
 *   @property {Function} setBackgroundSelected - Callback to update the selected background image key.
 *   @property {Function} clearPublisherBgIfSelectedDeleted - Callback to clean up background replacement if the selected background is deleted.
 *   @property {number} [refreshTrigger] - Optional timestamp to trigger refresh of custom images.
 * @returns {ReactElement} A horizontal stack of selectable option buttons.
 */
const BackgroundGallery = ({
  backgroundSelected,
  setBackgroundSelected,
  clearPublisherBgIfSelectedDeleted,
  refreshTrigger,
}: BackgroundGalleryProps): ReactElement => {
  const { getImagesFromStorage, deleteImageFromStorage } = useImageStorage();
  const [customImages, setCustomImages] = useState<StoredImage[]>([]);
  const { t } = useTranslation();
  const theme = useCustomTheme();

  const backgrounds = [
    {
      id: 'bg1',
      file: 'bookshelf-room.jpg',
      name: t('backgroundEffects.backgrounds.bookshelfRoom'),
    },
    { id: 'bg2', file: 'busy-room.jpg', name: t('backgroundEffects.backgrounds.busyRoom') },
    { id: 'bg3', file: 'dune-view.jpg', name: t('backgroundEffects.backgrounds.duneView') },
    { id: 'bg4', file: 'hogwarts.jpg', name: t('backgroundEffects.backgrounds.hogwarts') },
    { id: 'bg5', file: 'library.jpg', name: t('backgroundEffects.backgrounds.library') },
    { id: 'bg6', file: 'new-york.jpg', name: t('backgroundEffects.backgrounds.newYork') },
    { id: 'bg7', file: 'plane.jpg', name: t('backgroundEffects.backgrounds.plane') },
    { id: 'bg8', file: 'white-room.jpg', name: t('backgroundEffects.backgrounds.whiteRoom') },
  ];

  useEffect(() => {
    setCustomImages(getImagesFromStorage());
  }, [getImagesFromStorage, refreshTrigger]);

  const handleDelete = (id: string, dataUrl: string) => {
    if (backgroundSelected === dataUrl) {
      return;
    }
    deleteImageFromStorage(id);
    setCustomImages((imgs) => imgs.filter((img) => img.id !== id));
    clearPublisherBgIfSelectedDeleted(dataUrl);
  };

  return (
    <>
      {customImages.map(({ id, dataUrl }) => {
        const isSelected = backgroundSelected === dataUrl;
        return (
          <Box
            key={id}
            sx={{
              position: 'relative',
              display: 'inline-block',
            }}
          >
            <SelectableOption
              id={id}
              title={t('backgroundEffects.yourBackground')}
              isSelected={isSelected}
              onClick={() => setBackgroundSelected(dataUrl)}
              image={dataUrl}
            >
              <Tooltip
                title={
                  isSelected
                    ? t('backgroundEffects.deleteTooltipInUse')
                    : t('backgroundEffects.deleteTooltip')
                }
                arrow
              >
                <IconButton
                  data-testid={`background-delete-${id}`}
                  aria-label={t('backgroundEffects.deleteAriaLabel')}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                      handleDelete(id, dataUrl);
                    }
                  }}
                  size="small"
                  sx={{
                    color: isSelected ? theme.colors.textDisabled : theme.colors.background,
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    zIndex: 10,
                    cursor: isSelected ? 'default' : 'pointer',
                    backgroundColor: isSelected ? theme.colors.disabled : theme.colors.onBackground,
                    '&:hover': {
                      backgroundColor: isSelected ? theme.colors.disabled : theme.colors.background,
                    },
                  }}
                >
                  <VividIcon name="delete-solid" customSize={-6} />
                </IconButton>
              </Tooltip>
            </SelectableOption>
          </Box>
        );
      })}

      {backgrounds.map((bg) => {
        const path = `${BACKGROUNDS_PATH}/${bg.file}`;
        return (
          <SelectableOption
            key={bg.id}
            title={bg.name}
            id={bg.id}
            isSelected={backgroundSelected === bg.file}
            onClick={() => setBackgroundSelected(bg.file)}
            image={path}
          />
        );
      })}
    </>
  );
};

export default BackgroundGallery;
