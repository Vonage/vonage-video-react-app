import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import AddBackgroundEffectLayout from './AddBackgroundEffectLayout';

vi.mock('../../../../utils/useImageStorage/useImageStorage', () => ({
  useImageStorage: () => ({
    storageError: '',
    handleImageFromFile: vi.fn(async () => ({
      dataUrl: 'data:image/png;base64,MOCKED',
    })),
    handleImageFromLink: vi.fn(async () => ({
      dataUrl: 'data:image/png;base64,MOCKED_LINK',
    })),
  }),
}));

describe('AddBackgroundEffectLayout', () => {
  it('should render without crashing', () => {
    render(<AddBackgroundEffectLayout customBackgroundImageChange={vi.fn()} />);
    expect(screen.getByText(/Drag and Drop, or click here to upload Image/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Link from the web/i)).toBeInTheDocument();
    expect(screen.getByTestId('background-effect-link-submit-button')).toBeInTheDocument();
  });

  it('shows error for invalid file type', async () => {
    render(<AddBackgroundEffectLayout customBackgroundImageChange={vi.fn()} />);
    const input = screen.getByLabelText(/upload/i);
    const file = new File(['dummy'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(
      await screen.findByText(/Only JPG, PNG, or WebP images are allowed/i)
    ).toBeInTheDocument();
  });

  it('shows error for file size too large', async () => {
    render(<AddBackgroundEffectLayout customBackgroundImageChange={vi.fn()} />);
    const input = screen.getByLabelText(/upload/i);
    const file = new File(['x'.repeat(3 * 1024 * 1024)], 'big.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/Image must be less than 2MB/i)).toBeInTheDocument();
  });

  it('calls customBackgroundImageChange on valid file upload', async () => {
    const cb = vi.fn();
    render(<AddBackgroundEffectLayout customBackgroundImageChange={cb} />);
    const input = screen.getByLabelText(/upload/i);
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(cb).toHaveBeenCalledWith('data:image/png;base64,MOCKED'));
  });

  it('calls customBackgroundImageChange on valid link submit', async () => {
    const cb = vi.fn();
    render(<AddBackgroundEffectLayout customBackgroundImageChange={cb} />);
    const input = screen.getByPlaceholderText(/Link from the web/i);
    fireEvent.change(input, { target: { value: 'https://example.com/image.png' } });
    const button = screen.getByTestId('background-effect-link-submit-button');
    fireEvent.click(button);
    await waitFor(() => expect(cb).toHaveBeenCalledWith('data:image/png;base64,MOCKED_LINK'));
  });
});
