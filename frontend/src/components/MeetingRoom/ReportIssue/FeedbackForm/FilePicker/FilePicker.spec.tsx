import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, Mock, beforeEach } from 'vitest';
import useIsSmallViewport from '../../../../../hooks/useIsSmallViewport';
import FilePicker from './FilePicker';
import '@testing-library/jest-dom';

vi.mock('../../../../../hooks/useIsSmallViewport');
const mockUseIsSmallViewport = useIsSmallViewport as Mock<[], boolean>;

describe('FilePicker component', () => {
  const mockFileSelect = vi.fn();

  beforeEach(() => {
    mockUseIsSmallViewport.mockReturnValue(false);
  });

  it('renders the "Add screenshot" button initially', () => {
    render(<FilePicker onFileSelect={mockFileSelect} />);
    const addButton = screen.getByText(/add screenshot/i);
    expect(addButton).toBeInTheDocument();
  });

  describe('"Capture screenshot" button', () => {
    it('is rendered on desktop viewports', () => {
      render(<FilePicker onFileSelect={mockFileSelect} />);
      const addButton = screen.getByText(/capture screenshot/i);
      expect(addButton).toBeInTheDocument();
    });

    it('is not rendered on small viewports', () => {
      mockUseIsSmallViewport.mockReturnValue(true);
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
    const nativeMediaDevices = global.navigator.mediaDevices;
    vi.stubGlobal(
      'MediaStream',
      vi.fn().mockImplementation(() => ({
        active: true,
        getTracks: () => [],
      }))
    );

    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        getDisplayMedia: vi.fn(),
      },
    });
    const mockStream = new global.MediaStream();
    (navigator.mediaDevices.getDisplayMedia as Mock).mockResolvedValue(mockStream);

    // Mocking video element and canvas
    const videoElement = document.createElement('video');
    videoElement.srcObject = mockStream;
    document.body.appendChild(videoElement);

    // Mocking the play method
    videoElement.play = vi.fn().mockResolvedValue(undefined);

    // Stub the toDataURL function of HTMLCanvasElement
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,fakebase64data');

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

    expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(
      expectedDisplayMediaOptions
    );

    const image = await screen.findByAltText('screenshot');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('data:image/png'));

    const imageSrc = image.getAttribute('src');
    expect(mockFileSelect).toHaveBeenCalledWith(imageSrc);

    // Cleanup
    vi.unstubAllGlobals();
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: nativeMediaDevices,
    });
  });
});
