import { ReactElement } from 'react';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <Tooltip
      title={
        isDisabled ? (
          t('backgroundEffects.limit')
        ) : (
          <>
            {t('backgroundEffects.recommended.specs')}
            <br />
            {t('backgroundEffects.recommended.note')}
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
