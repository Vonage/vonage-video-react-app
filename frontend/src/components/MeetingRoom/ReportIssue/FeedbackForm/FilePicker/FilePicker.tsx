import { ChangeEvent, useRef, useState, ReactElement } from 'react';
import { Button, IconButton, Tooltip, Typography } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import captureScreenshot from '../../../../../utils/captureScreenshot';
import { isMobile } from '../../../../../utils/util';

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
        console.warn(error.message);
      }
    }
  };
  return (
    <>
      {imageSrc && (
        <Typography
          sx={{
            marginBottom: '24px',
            textAlign: 'left',
          }}
        >
          {t('filePicker.attachedScreenshot')}
        </Typography>
      )}
      <div className="my-2">
        {maximumSizeError && (
          <Typography
            color="error"
            sx={{
              marginBottom: '6px',
              textAlign: 'left',
            }}
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
              {/*
               */}
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
          <div className="relative flex">
            <div className="relative">
              <img
                alt="screenshot"
                width={100}
                height={80}
                ref={imageRef}
                src={imageSrc}
                className="size-full object-cover"
              />
              <Tooltip title={t('filePicker.delete')}>
                <IconButton
                  data-testid="delete-screenshot"
                  onClick={handleDeleteFile}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    transform: 'translate(50%, -50%)',
                    borderRadius: '50%',
                    backgroundColor: 'rgb(69,71,70)',
                    '&:hover': {
                      backgroundColor: 'rgb(99,99,99)',
                    },
                  }}
                >
                  <Delete sx={{ color: 'rgb(233,186,183)' }} />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FilePicker;
