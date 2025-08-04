import { ReactElement } from 'react';
import { Box } from '@mui/material';
import { BACKGROUNDS_PATH } from '../../../utils/constants';
import SelectableOption from '../SelectableOption';

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

/**
 * Renders a group of selectable images for background replacement in a meeting room.
 *
 * Each button represents a different background image option.
 * @param {BackgroundGalleryProps} props - The props for the component.
 *   @property {string} backgroundSelected - The currently selected background image key.
 *   @property {Function} setBackgroundSelected - Callback to update the selected background image key.
 * @returns {ReactElement} A horizontal stack of selectable option buttons.
 */
const BackgroundGallery = ({
  backgroundSelected,
  setBackgroundSelected,
}: BackgroundGalleryProps): ReactElement => {
  return (
    <>
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
