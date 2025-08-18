import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { ChangeEvent, ReactElement, useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LinkIcon from '@mui/icons-material/Link';
import { useImageStorage } from '../../../../utils/useImageStorage/useImageStorage';

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
        customBackgroundImageChange(newImage.dataUrl);
        setFileError('');
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
      <label htmlFor="file-upload">
        <input
          id="file-upload"
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          hidden
          onChange={handleFileChange}
        />
        <Box
          sx={{
            padding: '12px',
            border: '1px dashed #C1C1C1',
            backgroundColor: '#f9f9f9',
            borderRadius: '16px',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <>
            <CloudUploadIcon sx={{ fontSize: 50, color: '#989A9D' }} />
            <Typography mt={1}>
              Drag and Drop, or click here to upload Image,
              <br />
              Max 2MB
            </Typography>
          </>
        </Box>
      </label>

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
