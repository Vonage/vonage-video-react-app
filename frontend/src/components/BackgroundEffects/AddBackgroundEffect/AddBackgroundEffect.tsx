import { ReactElement } from 'react';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Tooltip } from '@mui/material';
import SelectableOption from '../SelectableOption';

export type AddBackgroundEffectProps = {
  isDisabled?: boolean;
};

/**
 * Renders a button that allows user to upload background effects.
 *
 * This button is disabled if the user has reached the maximum limit of custom images.
 * @param {AddBackgroundEffectProps} props - the props for the component.
 *   @property {boolean} isDisabled - Whether the button is disabled.
 * @returns {ReactElement} A button for uploading background effects.
 */
const AddBackgroundEffect = ({ isDisabled = false }: AddBackgroundEffectProps): ReactElement => {
  return (
    <Tooltip
      title={
        isDisabled ? (
          'You have reached the maximum custom images limit'
        ) : (
          <>
            Recommended: JPG/PNG img. at 1280x720 resolution.
            <br />
            Note: Images are stored only locally in the browser.
          </>
        )
      }
      arrow
    >
      <SelectableOption
        id="upload"
        isSelected={false}
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
