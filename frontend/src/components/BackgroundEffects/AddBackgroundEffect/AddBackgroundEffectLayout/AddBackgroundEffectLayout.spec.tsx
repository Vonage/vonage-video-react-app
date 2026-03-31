import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeAll } from 'vitest';
import AddBackgroundEffectLayout from './AddBackgroundEffectLayout';
import enTranslations from '../../../../locales/en.json';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'backgroundEffects.invalidFileType': enTranslations['backgroundEffects.invalidFileType'],
        'backgroundEffects.fileTooLarge': enTranslations['backgroundEffects.fileTooLarge'],
        'backgroundEffects.maxSize': enTranslations['backgroundEffects.maxSize'],
        'backgroundEffects.addBackground': enTranslations['backgroundEffects.addBackground'],
      };

      let translation = translations[key] || key;

      if (options && typeof translation === 'string') {
        Object.keys(options).forEach((param) => {
          translation = translation.replace(`{{${param}}}`, String(options[param]));
        });
      }

      return translation;
    },
  }),
}));

vi.mock('@utils/useImageStorage/useImageStorage', () => ({
  __esModule: true,
  default: () => ({
    storageError: '',
    handleImageFromFile: vi.fn(() => ({
      dataUrl: 'data:image/png;base64,MOCKED',
    })),
    handleImageFromLink: vi.fn(() => ({
      dataUrl: 'data:image/png;base64,MOCKED_LINK',
    })),
  }),
}));

describe('AddBackgroundEffectLayout', () => {
  const cb = vi.fn();

  beforeAll(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    render(
      <AddBackgroundEffectLayout backgroundSelected="0" customBackgroundImageChange={vi.fn()} />
    );
    expect(screen.getByTestId('background-add-background')).toBeInTheDocument();
    expect(screen.getByTestId('vivid-icon-add-image-line')).toBeInTheDocument();
  });

  it('shows error for invalid file type', async () => {
    render(
      <AddBackgroundEffectLayout backgroundSelected="0" customBackgroundImageChange={vi.fn()} />
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(
      await screen.findByText(/Only JPG, PNG, GIF, or BMP images are allowed/i)
    ).toBeInTheDocument();
  });

  it('shows error for file size too large', async () => {
    render(
      <AddBackgroundEffectLayout backgroundSelected="0" customBackgroundImageChange={vi.fn()} />
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'.repeat(3 * 1024 * 1024)], 'big.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/Image must be less than 2MB/i)).toBeInTheDocument();
  });

  it('handles valid image file upload', async () => {
    render(<AddBackgroundEffectLayout backgroundSelected="0" customBackgroundImageChange={cb} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(cb).toHaveBeenCalledWith('data:image/png;base64,MOCKED'));
  });
});
