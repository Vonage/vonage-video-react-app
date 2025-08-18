import { ReactElement, useEffect, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { BACKGROUNDS_PATH } from '../../../utils/constants';
import SelectableOption from '../SelectableOption';
import { StoredImage, useImageStorage } from '../../../utils/useImageStorage/useImageStorage';

export const backgrounds = [
  { id: 'bg1', file: 'bookshelf-room.jpg' },
  { id: 'bg2', file: 'busy-room.jpg' },
  { id: 'bg3', file: 'dune-view.jpg' },
  { id: 'bg4', file: 'hogwarts.jpg' },
  { id: 'bg5', file: 'library.jpg' },
  { id: 'bg6', file: 'new-york.jpg' },
  { id: 'bg7', file: 'plane.jpg' },
  { id: 'bg8', file: 'white-room.jpg' },
];

export type BackgroundGalleryProps = {
  backgroundSelected: string;
  setBackgroundSelected: (key: string) => void;
};

const BackgroundGallery = ({
  backgroundSelected,
  setBackgroundSelected,
}: BackgroundGalleryProps): ReactElement => {
  const { getImagesFromStorage, deleteImageFromStorage } = useImageStorage();
  const [customImages, setCustomImages] = useState<StoredImage[]>([]);

  useEffect(() => {
    setCustomImages(getImagesFromStorage());
  }, [getImagesFromStorage]);

  const handleDelete = (id: string) => {
    if (backgroundSelected === id) {
      return;
    }
    deleteImageFromStorage(id);
    setCustomImages((imgs) => imgs.filter((img) => img.id !== id));
  };

  return (
    <>
      {customImages.map(({ id, dataUrl }) => (
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
            isSelected={backgroundSelected === dataUrl}
            onClick={() => setBackgroundSelected(dataUrl)}
            image={dataUrl}
          />
          <IconButton
            aria-label="Delete custom background"
            onClick={() => handleDelete(id)}
            size="small"
            disabled={backgroundSelected === dataUrl}
            sx={{
              color: 'white',
              position: 'absolute',
              top: -8,
              right: -8,
              backgroundColor: 'rgba(0,0,0,0.8)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,1)',
              },
              '&:disabled': {
                backgroundColor: 'rgba(0,0,0,0.4)',
                color: 'rgba(255,255,255,0.5)',
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

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
