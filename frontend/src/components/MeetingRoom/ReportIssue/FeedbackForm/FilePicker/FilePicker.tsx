import { ChangeEvent, useRef, useState, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import captureScreenshot from '../../../../../utils/captureScreenshot';
import { isMobile } from '@web/platform';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useTheme from '@ui/theme';
import VividIcon from '@components/VividIcon';

// Setting the maximum file size to 20MB
const maxFileSize = 2e7;

/**
 * FilePicker Component
 *
 * This component allows users to upload an image, preview it, and delete the uploaded image.
 * The component validates file size, displays a preview for supported images, and includes a delete button.
 * @param {(fileData: string) => void} onFileSelect - the function that handles storing the file value.
 * @returns {ReactElement} The exit button component
 */
const FilePicker = ({
  onFileSelect,
}: {
  onFileSelect: (fileData: string) => void;
}): ReactElement => {
  const { t } = useTranslation();
  const [imageSrc, setImageSrc] = useState<string>('');
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [maximumSizeError, setMaximumSizeError] = useState<boolean>(false);
  const theme = useTheme();

  const checkIfSizeAllowed = (file: File) => {
    if (file.size > maxFileSize) {
      setMaximumSizeError(true);
      return false;
    }
    return true;
  };

  /**
   * Clears the uploaded image preview by setting `imageSrc` to `null`.
   */
  const handleDeleteFile = () => {
    setImageSrc('');
  };

  /**
   * Handles file upload and validates the file type.
   * If the file size is allowed, reads the file and sets it as the image preview.
   * @param {ChangeEvent<HTMLInputElement>} event - The file input change event
   */
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && checkIfSizeAllowed(file)) {
      setMaximumSizeError(false);
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target?.result as string;
        setImageSrc(fileData);
        onFileSelect(fileData);
      };
      reader.readAsDataURL(file);
    }
  };

  const processScreenshot = async () => {
    try {
      const screenshotData = await captureScreenshot();
      setImageSrc(screenshotData);
      onFileSelect(screenshotData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  };
  return (
    <>
      {imageSrc && (
        <Typography
          variant="subtitle1"
          sx={{
            mt: 2,
            mb: maximumSizeError ? 0 : 2,
            textAlign: 'left',
          }}
        >
          {t('filePicker.attachedScreenshot')}
        </Typography>
      )}
      <Box sx={{ my: 1 }}>
        {maximumSizeError && (
          <Typography
            color={theme.colors.error}
            sx={{
              mb: 0.75,
              textAlign: 'left',
            }}
            variant="body2"
          >
            {t('filePicker.sizeLimit')}
          </Typography>
        )}
        {!imageSrc ? (
          <>
            {!isMobile() && (
              // The screenshot capture relies on the getDisplayMedia browser API which is unsupported on mobile devices
              // See: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia#browser_compatibility
              <Button
                sx={{
                  width: '100%',
                  textTransform: 'none',
                  mb: 1,
                }}
                variant="outlined"
                component="label"
                onClick={processScreenshot}
              >
                {t('filePicker.capture')}
              </Button>
            )}
            <Button
              sx={{ width: '100%', textTransform: 'none' }}
              variant="outlined"
              component="label"
            >
              {t('filePicker.addScreenshot')}
              <input
                accept=".jpg, .jpeg, .png, .gif"
                name="upload"
                type="file"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
          </>
        ) : (
          <Box sx={{ position: 'relative', display: 'flex' }}>
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                alt="screenshot"
                width={100}
                height={80}
                ref={imageRef}
                src={imageSrc}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <Tooltip arrow title={t('filePicker.delete')}>
                <IconButton
                  data-testid="delete-screenshot"
                  onClick={handleDeleteFile}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 10,
                    transform: 'translate(50%, -50%)',
                    borderRadius: '50%',
                    backgroundColor: theme.colors.tertiary,
                    '&:hover': {
                      backgroundColor: theme.colors.tertiaryHover,
                    },
                  }}
                >
                  <VividIcon
                    customSize={-6}
                    name="delete-solid"
                    sx={{ color: theme.colors.onTertiary }}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default FilePicker;
