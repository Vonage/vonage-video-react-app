import { render, screen, fireEvent } from '@testing-library/react';
import { it, vi, describe, expect } from 'vitest';
import FileUploader from './FileUploader';

describe('FileUploader', () => {
  it('renders upload UI', () => {
    render(<FileUploader handleFileChange={vi.fn()} />);
    expect(screen.getByText(/Drag and drop, or click here to upload image/i)).toBeInTheDocument();
    expect(screen.getByTestId('file-upload-input')).toBeInTheDocument();
    expect(screen.getByTestId('file-upload-drop-area')).toBeInTheDocument();
  });

  it('handles file input change', () => {
    const handleFileChange = vi.fn();
    render(<FileUploader handleFileChange={handleFileChange} />);
    const input = screen.getByTestId('file-upload-input');
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(handleFileChange).toHaveBeenCalled();
  });

  it('handles file drop event', () => {
    const handleFileChange = vi.fn();
    render(<FileUploader handleFileChange={handleFileChange} />);
    const box = screen.getByTestId('file-upload-drop-area');
    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
    const dataTransfer = {
      files: [file],
      clearData: vi.fn(),
    };
    fireEvent.drop(box, { dataTransfer });
    expect(handleFileChange).toHaveBeenCalledWith({ target: { files: [file] } });
  });

  it('shows drag over style when dragging', () => {
    render(<FileUploader handleFileChange={vi.fn()} />);
    const box = screen.getByTestId('file-upload-drop-area');
    fireEvent.dragOver(box);
    expect(box).toHaveStyle('border: 2px dashed #1976d2');
    fireEvent.dragLeave(box);
    expect(box).toHaveStyle('border: 1px dashed #C1C1C1');
  });
});
