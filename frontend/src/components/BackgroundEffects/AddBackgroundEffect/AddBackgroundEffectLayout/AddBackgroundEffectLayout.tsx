import { ChangeEvent, ReactElement, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import VividIcon from '@ui/VividIcon';
import { env } from '../../../../env';
import { ALLOWED_TYPES, MAX_SIZE_MB } from '../../../../utils/constants';
import useImageStorage from '@utils/useImageStorage/useImageStorage';
import SelectableOption from '@components/BackgroundEffects/SelectableOption';

export type AddBackgroundEffectLayoutProps = {
  customBackgroundImageChange: (dataUrl: string) => void;
  backgroundSelected: string;
};

/**
 * AddBackgroundEffectLayout Component
 *
 * This component manages the UI for adding background effects via file upload.
 * @param {AddBackgroundEffectLayoutProps} props - The props for the component.
 *   @property {Function} customBackgroundImageChange - Callback function to handle background image change.
 *   @property {string} backgroundSelected - The currently selected background effect key.
 * @returns {ReactElement} The add background effect layout component.
 */
const AddBackgroundEffectLayout = ({
  customBackgroundImageChange,
  backgroundSelected,
}: AddBackgroundEffectLayoutProps): ReactElement => {
  const [fileError, setFileError] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);
  const { storageError, handleImageFromFile } = useImageStorage();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError(t('backgroundEffects.invalidFileType'));
      setShowError(true);
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(t('backgroundEffects.fileTooLarge', { maxSize: MAX_SIZE_MB }));
      setShowError(true);
      return;
    }

    try {
      const newImage = await handleImageFromFile(file);
      if (newImage) {
        setFileError('');
        setShowError(false);
        customBackgroundImageChange(newImage.dataUrl);
      }
    } catch {
      setFileError(t('backgroundEffects.processingError'));
      setShowError(true);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleCloseError = () => {
    setFileError('');
    setShowError(false);
  };

  const errorMessage = fileError || storageError;

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <SelectableOption
        id="add-background"
        title={t('backgroundEffects.addBackground')}
        isSelected={backgroundSelected === 'add-background'}
        onClick={handleClick}
        icon={<VividIcon name="add-image-line" customSize={-2} style={{ marginLeft: '2px' }} />}
      />

      <Snackbar
        open={showError && !!errorMessage}
        autoHideDuration={env.NOTIFICATION_DURATION_MS}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddBackgroundEffectLayout;
