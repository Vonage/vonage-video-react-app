import { ChangeEvent, useState, DragEvent, ReactElement } from 'react';
import { Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export type FileUploaderProps = {
  handleFileChange: (
    event: ChangeEvent<HTMLInputElement> | { target: { files: FileList } }
  ) => void;
};

/**
 * FileUploader component allows users to upload image files via drag-and-drop or file selection.
 *
 * This component manages the UI for adding background effects.
 * @param {FileUploaderProps} props - The props for the component.
 *   @property {Function} handleFileChange - Callback function to handle background image change.
 * @returns {ReactElement} The add background effect layout component.
 */
const FileUploader = ({ handleFileChange }: FileUploaderProps): ReactElement => {
  const [dragOver, setDragOver] = useState(false);

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      handleFileChange({ target: { files } });
      e.dataTransfer.clearData();
    }
  };

  return (
    <label htmlFor="file-upload" style={{ width: '100%', cursor: 'pointer' }}>
      <input
        id="file-upload"
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        hidden
        onChange={handleFileChange}
        data-testid="file-upload-input"
      />
      <Box
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        sx={{
          padding: '12px',
          border: dragOver ? '2px dashed #1976d2' : '1px dashed #C1C1C1',
          backgroundColor: dragOver ? '#e3f2fd' : '#f9f9f9',
          borderRadius: '16px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          userSelect: 'none',
        }}
        data-testid="file-upload-drop-area"
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
  );
};

export default FileUploader;
