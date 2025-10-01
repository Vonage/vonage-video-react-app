import { ReactElement, useEffect, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { BACKGROUNDS_PATH } from '../../../utils/constants';
import SelectableOption from '../SelectableOption';
import useImageStorage, { StoredImage } from '../../../utils/useImageStorage/useImageStorage';

export const backgrounds = [
  { id: 'bg1', file: 'bookshelf-room.jpg', name: 'Bookshelf Room' },
  { id: 'bg2', file: 'busy-room.jpg', name: 'Busy Room' },
  { id: 'bg3', file: 'dune-view.jpg', name: 'Dune View' },
  { id: 'bg4', file: 'hogwarts.jpg', name: 'Hogwarts' },
  { id: 'bg5', file: 'library.jpg', name: 'Library' },
  { id: 'bg6', file: 'new-york.jpg', name: 'New York' },
  { id: 'bg7', file: 'plane.jpg', name: 'Plane' },
  { id: 'bg8', file: 'white-room.jpg', name: 'White Room' },
];

export type BackgroundGalleryProps = {
  backgroundSelected: string;
  setBackgroundSelected: (dataUrl: string) => void;
  clearPublisherBgIfSelectedDeleted: (dataUrl: string) => void;
};

/**
 * Renders a group of selectable images for background replacement in a meeting room.
 *
 * Each button represents a different background image option.
 * @param {BackgroundGalleryProps} props - The props for the component.
 *   @property {string} backgroundSelected - The currently selected background image key.
 *   @property {Function} setBackgroundSelected - Callback to update the selected background image key.
 *   @property {Function} clearPublisherBgIfSelectedDeleted - Callback to clean up background replacement if the selected background is deleted.
 * @returns {ReactElement} A horizontal stack of selectable option buttons.
 */
const BackgroundGallery = ({
  backgroundSelected,
  setBackgroundSelected,
  clearPublisherBgIfSelectedDeleted,
}: BackgroundGalleryProps): ReactElement => {
  const { getImagesFromStorage, deleteImageFromStorage } = useImageStorage();
  const [customImages, setCustomImages] = useState<StoredImage[]>([]);

  useEffect(() => {
    setCustomImages(getImagesFromStorage());
  }, [getImagesFromStorage]);

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
              title="Your Background"
              isSelected={isSelected}
              onClick={() => setBackgroundSelected(dataUrl)}
              image={dataUrl}
            >
              <Tooltip
                title={
                  isSelected
                    ? "You can't remove this background while it's in use"
                    : 'Delete background'
                }
                arrow
              >
                <IconButton
                  data-testid={`background-delete-${id}`}
                  aria-label="Delete custom background"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                      handleDelete(id, dataUrl);
                    }
                  }}
                  size="small"
                  sx={{
                    color: 'white',
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    zIndex: 10,
                    cursor: isSelected ? 'default' : 'pointer',
                    backgroundColor: isSelected ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.8)',
                    '&:hover': {
                      backgroundColor: isSelected ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.8)',
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
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
