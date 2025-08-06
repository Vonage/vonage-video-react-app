import { Box, CircularProgress, IconButton, Paper, TextField, Typography } from '@mui/material';
import { ReactElement, useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';

/* export type AddBackgroundEffectLayoutProps = {
}; */

/**
 * Renders a button that allows user to upload background effects.
 *
 * This button is disabled if the user has reached the maximum limit of custom images.
 * @returns {ReactElement} A button for uploading background effects.
 */
const AddBackgroundEffectLayout = (/* : AddBackgroundEffectLayoutProps */): ReactElement => {
  const MAX_SIZE_MB = 2;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const [fileError, setFileError] = useState('');
  const [imageLink, setImageLink] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // 📦 File Upload Validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Only JPG, PNG, or WebP images are allowed.');
    } else if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError('Image must be less than 2MB.');
    } else {
      setFileError('');
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 🌐 Link Validation
  const isValidImageUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return /\.(jpg|jpeg|png|webp)$/i.test(parsed.pathname);
    } catch {
      return false;
    }
  };

  const handleLinkSubmit = () => {
    setFileError('');
    setLinkLoading(true);
    setImagePreview('');

    if (!isValidImageUrl(imageLink)) {
      setFileError('Invalid image URL or extension.');
      setLinkLoading(false);
      return;
    }

    // Try to load the image
    const img = new Image();
    img.onload = () => {
      setLinkLoading(false);
      setImagePreview(imageLink);
    };
    img.onerror = () => {
      setLinkLoading(false);
      setFileError('Could not load image from URL.');
    };
    img.src = imageLink;
  };

  return (
    <Box sx={{ width: 300, mx: 'auto', mt: 4 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          border: '2px dashed #90caf9',
          textAlign: 'center',
          bgcolor: '#f9f9f9',
        }}
      >
        <label htmlFor="file-upload">
          <input
            id="file-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            hidden
            onChange={handleFileChange}
          />
          <Box sx={{ cursor: 'pointer' }}>
            <CloudUploadIcon sx={{ fontSize: 40, color: '#90caf9' }} />
            <Typography mt={1}>
              Drag and Drop, or click here to upload Image,
              <br />
              Max 2MB
            </Typography>
          </Box>
        </label>
      </Paper>

      {fileError && (
        <Typography color="error" mt={1} fontSize={14}>
          {fileError}
        </Typography>
      )}

      <Box mt={2} display="flex" alignItems="center" gap={1}>
        <TextField
          fullWidth
          size="small"
          placeholder="Link from the web"
          value={imageLink}
          onChange={(e) => setImageLink(e.target.value)}
        />
        <IconButton color="primary" onClick={handleLinkSubmit}>
          {linkLoading ? <CircularProgress size={24} /> : <LinkIcon />}
        </IconButton>
      </Box>

      {imagePreview && (
        <Box mt={2} textAlign="center">
          <img
            src={imagePreview}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
          />
        </Box>
      )}
    </Box>
  );
};

export default AddBackgroundEffectLayout;
