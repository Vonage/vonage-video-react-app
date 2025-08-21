import { render, screen, fireEvent } from '@testing-library/react';
import { it, vi, describe, expect } from 'vitest';
import FileUploader from './FileUploader';

describe('FileUploader', () => {
  it('renders upload UI', () => {
    render(<FileUploader handleFileChange={vi.fn()} />);
    expect(screen.getByText(/Drag and Drop, or click here to upload Image/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { hidden: true })).toBeInTheDocument();
  });

  it('calls handleFileChange on file input change', () => {
    const handleFileChange = vi.fn();
    render(<FileUploader handleFileChange={handleFileChange} />);
    const input = screen.getByLabelText(/upload/i);
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(handleFileChange).toHaveBeenCalled();
  });

  it('calls handleFileChange on drop', () => {
    const handleFileChange = vi.fn();
    render(<FileUploader handleFileChange={handleFileChange} />);
    const box = screen.getByText(/Drag and Drop, or click here to upload Image/i).closest('div');
    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
    const dataTransfer = {
      files: [file],
      clearData: vi.fn(),
    };
    fireEvent.drop(box!, { dataTransfer });
    expect(handleFileChange).toHaveBeenCalledWith({ target: { files: [file] } });
  });

  it('shows drag over style when dragging', () => {
    render(<FileUploader handleFileChange={vi.fn()} />);
    const box = screen.getByText(/Drag and Drop, or click here to upload Image/i).closest('div');
    fireEvent.dragOver(box!);
    expect(box).toHaveStyle('border: 2px dashed #1976d2');
    fireEvent.dragLeave(box!);
    expect(box).toHaveStyle('border: 1px dashed #C1C1C1');
  });
});
