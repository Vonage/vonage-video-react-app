import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FilePicker from './FilePicker';
import { isMobile } from '@web/platform';
import '@testing-library/jest-dom';
import { setupWindowNavigatorMock } from '@web-test/fixtures';

vi.mock('@web/platform');

describe('FilePicker component', () => {
  beforeEach(() => {
    setupWindowNavigatorMock();
  });

  const mockFileSelect = vi.fn();

  it('renders the "Add screenshot" button initially', () => {
    render(<FilePicker onFileSelect={mockFileSelect} />);
    const addButton = screen.getByText(/add screenshot/i);
    expect(addButton).toBeInTheDocument();
  });

  describe('"Capture screenshot" button', () => {
    it('is rendered on desktop devices', () => {
      render(<FilePicker onFileSelect={mockFileSelect} />);
      const addButton = screen.getByText(/capture screenshot/i);
      expect(addButton).toBeInTheDocument();
    });

    it('is not rendered on mobile devices', () => {
      vi.mocked(isMobile).mockImplementation(() => true);

      const addButton = screen.queryByText(/capture screenshot/i);
      expect(addButton).not.toBeInTheDocument();
    });
  });

  it('uploads and previews a valid image file', async () => {
    render(<FilePicker onFileSelect={mockFileSelect} />);

    const input = screen.getByLabelText(/add screenshot/i); // File input

    // Create a mock image file
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });

    // Simulate file upload
    fireEvent.change(input, { target: { files: [file] } });

    // Assert that the image preview appears
    const image = await screen.findByAltText('screenshot');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('data:image/png')); // Check that the src is a data URL

    // Check that the parent component has been notified of changes
    const imageSrc = image.getAttribute('src');
    expect(mockFileSelect).toHaveBeenCalledWith(imageSrc);
  });

  it('shows an error if the file is too large', async () => {
    render(<FilePicker onFileSelect={mockFileSelect} />);

    const input = screen.getByLabelText(/add screenshot/i); // File input

    // Create a mock image file
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });

    // Mock the file's size to simulate an oversized file
    Object.defineProperty(file, 'size', { value: 21 * 1024 * 1024 }); // 21MB

    // Simulate file upload
    fireEvent.change(input, { target: { files: [file] } });

    // Expect an error message to be displayed for a file too large
    expect(await screen.findByText(/The maximum upload size is 20MB/i)).toBeInTheDocument();
  });

  it('takes a screenshot when Capture screenshot button is clicked', async () => {
    const MockMediaStream = vi.fn().mockImplementation(() => ({
      active: true,
      getTracks: () => [],
    }));

    const getDisplayMediaMock = vi.fn();
    vi.spyOn(navigator.mediaDevices, 'getDisplayMedia').mockImplementation(getDisplayMediaMock);

    const mockStream = new MockMediaStream();
    getDisplayMediaMock.mockResolvedValue(mockStream);

    // Mocking the play method
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

    // Mock canvas context and drawing operations
    const mockContext = {
      drawImage: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      mockContext as unknown as CanvasRenderingContext2D
    );

    // Stub the toDataURL function of HTMLCanvasElement
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/png;base64,fakebase64data'
    );

    render(<FilePicker onFileSelect={mockFileSelect} />);

    const button = screen.getByRole('button', { name: /capture screenshot/i });
    fireEvent.click(button);

    const expectedDisplayMediaOptions = {
      video: {
        displaySurface: 'tab',
      },
      audio: false,
      preferCurrentTab: true,
    };

    expect(getDisplayMediaMock).toHaveBeenCalledWith(expectedDisplayMediaOptions);

    const image = await screen.findByAltText('screenshot');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('data:image/png'));

    const imageSrc = image.getAttribute('src');
    expect(mockFileSelect).toHaveBeenCalledWith(imageSrc);
  });
});
