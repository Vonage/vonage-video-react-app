import React, { ReactElement } from 'react';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Tooltip } from '@mui/material';
import SelectableOption from '../SelectableOption';

interface AddBackgroundEffectProps {
  isDisabled?: boolean;
}

/**
 * Renders a button that allows user to upload background effects.
 * This button is disabled if the user has reached the maximum limit of custom images.
 *
 * @param {AddBackgroundEffectProps} props - the props for the component.
 *   @property {boolean} isDisabled - Whether the button is disabled.
 * @returns {ReactElement} A button for uploading background effects.
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
