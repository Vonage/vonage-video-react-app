import { ReactElement, useEffect, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { BACKGROUNDS_PATH } from '../../../utils/constants';
import SelectableOption from '../SelectableOption';
import { StoredImage, useImageStorage } from '../../../utils/useImageStorage/useImageStorage';

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
  cleanPublisherBackgroundReplacementIfSelectedAndDeleted: (dataUrl: string) => void;
};

const BackgroundGallery = ({
  backgroundSelected,
  setBackgroundSelected,
  cleanPublisherBackgroundReplacementIfSelectedAndDeleted,
}: BackgroundGalleryProps): ReactElement => {
  const { getImagesFromStorage, deleteImageFromStorage } = useImageStorage();
  const [customImages, setCustomImages] = useState<StoredImage[]>([]);

  useEffect(() => {
    setCustomImages(getImagesFromStorage());
  }, [getImagesFromStorage]);

  const handleDelete = (id: string, dataUrl: string) => {
    if (backgroundSelected === id) {
      return;
    }
    deleteImageFromStorage(id);
    setCustomImages((imgs) => imgs.filter((img) => img.id !== id));
    cleanPublisherBackgroundReplacementIfSelectedAndDeleted(dataUrl);
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
              mb: 1,
              mr: 1,
            }}
          >
            <SelectableOption
              id={id}
              title="Your Background"
              isSelected={isSelected}
              onClick={() => setBackgroundSelected(dataUrl)}
              image={dataUrl}
            />
            <Tooltip
              title={isSelected ? "You can't remove this background while it's in use" : ''}
              arrow
            >
              <IconButton
                aria-label="Delete custom background"
                onClick={() => !isSelected && handleDelete(id, dataUrl)}
                size="small"
                sx={{
                  color: 'white',
                  position: 'absolute',
                  top: -8,
                  right: -8,
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
          </Box>
        );
      })}

      {backgrounds.map((bg) => {
        const path = `${BACKGROUNDS_PATH}/${bg.file}`;
        return (
          <Box
            data-testid="background-gallery"
            key={bg.id}
            sx={{
              mb: 1,
            }}
          >
            <SelectableOption
              title={bg.name}
              id={bg.id}
              isSelected={backgroundSelected === bg.file}
              onClick={() => setBackgroundSelected(bg.file)}
              image={path}
            />
          </Box>
        );
      })}
    </>
  );
};

export default BackgroundGallery;
