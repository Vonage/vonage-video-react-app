import React, { ReactElement } from 'react';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Tooltip } from '@mui/material';
import SelectableOption from '../SelectableOption';

interface AddBackgroundEffectProps {
  isDisabled?: boolean;
}

/**
 * Renders a group of selectable buttons for background effects in a meeting room.
 *
 * Each button represents a different background effect option.
 * @param {AddBackgroundEffectProps} props - the props for the component.
 *   @property {boolean} isDisabled - Whether the button is disabled.
 * @returns {ReactElement} A horizontal stack of selectable option buttons.
 */
const AddBackgroundEffect: React.FC<AddBackgroundEffectProps> = ({
  isDisabled = false,
}): ReactElement => {
  return (
    <Tooltip
      title={
        isDisabled ? (
          'You have reached the maximum custom images limit'
        ) : (
          <>
            Recommended: JPG/PNG images at 1280x720 res.
            <br />
            Note: Custom images are stored locally in the browser.
          </>
        )
      }
      arrow
    >
      <SelectableOption
        id="upload"
        selected={false}
        isDisabled={isDisabled}
        onClick={
          () => {}
          // TODO: Implement upload functionality
        }
        icon={<AddPhotoAlternateIcon sx={{ fontSize: '30px' }} />}
      />
    </Tooltip>
  );
};

export default AddBackgroundEffect;
