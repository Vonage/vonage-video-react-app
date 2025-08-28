import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { ChangeEvent, ReactElement, useState } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LinkIcon from '@mui/icons-material/Link';
import { useImageStorage } from '../../../../utils/useImageStorage/useImageStorage';
import FileUploader from '../../FileUploader/FileUploader';

export type AddBackgroundEffectLayoutProps = {
  customBackgroundImageChange: (param1: string) => void;
};

/**
 * AddBackgroundEffectLayout Component
 *
 * This component manages the UI for adding background effects.
 * @param {AddBackgroundEffectLayoutProps} props - The props for the component.
 *   @property {Function} customBackgroundImageChange - Callback function to handle background image change.
 * @returns {ReactElement} The add background effect layout component.
 */
const AddBackgroundEffectLayout = ({
  customBackgroundImageChange,
}: AddBackgroundEffectLayoutProps): ReactElement => {
  const MAX_SIZE_MB = 2;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const [fileError, setFileError] = useState('');
  const [imageLink, setImageLink] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const { storageError, handleImageFromFile, handleImageFromLink } = useImageStorage();

  type HandleFileChangeType = ChangeEvent<HTMLInputElement> | { target: { files: FileList } };

  const handleFileChange = async (e: HandleFileChangeType) => {
    const { files } = e.target;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Only JPG, PNG, or WebP images are allowed.');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError('Image must be less than 2MB.');
      return;
    }

    try {
      const newImage = await handleImageFromFile(file);
      if (newImage) {
        setFileError('');
        customBackgroundImageChange(newImage.dataUrl);
      }
    } catch {
      setFileError('Failed to process uploaded image.');
    }
  };

  const handleLinkSubmit = async () => {
    setFileError('');
    setLinkLoading(true);
    try {
      const newImage = await handleImageFromLink(imageLink);
      if (newImage) {
        setFileError('');
        customBackgroundImageChange(newImage.dataUrl);
      } else {
        setFileError('Failed to store image.');
      }
    } catch {
      // error handled in hook
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <Box>
      <FileUploader handleFileChange={handleFileChange} />

      {(fileError || storageError) && (
        <Typography color="error" mt={1} fontSize={14}>
          {fileError || storageError}
        </Typography>
      )}

      <Box mt={2} display="flex" alignItems="center" gap={1}>
        <TextField
          fullWidth
          size="small"
          placeholder="Link from the web"
          className="add-background-effect-input"
          value={imageLink}
          onChange={(e) => setImageLink(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {linkLoading ? <CircularProgress size={24} /> : <LinkIcon sx={{ fontSize: 24 }} />}
              </InputAdornment>
            ),
          }}
        />

        <Button
          data-testid="background-effect-link-submit-button"
          variant="contained"
          color="primary"
          onClick={handleLinkSubmit}
          disabled={linkLoading}
          style={{ minWidth: 0, padding: '8px 12px' }}
        >
          {linkLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <ArrowForwardIcon sx={{ fontSize: 24 }} />
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default AddBackgroundEffectLayout;
