import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BackgroundGallery from './BackgroundGallery';
import enTranslations from '../../../locales/en.json';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';

vi.mock('@hooks/useBackgroundPublisherContext');

const customImages = [
  { id: 'custom1', dataUrl: 'data:image/png;base64,custom1' },
  { id: 'custom2', dataUrl: 'data:image/png;base64,custom2' },
];

const backgrounds = [
  {
    id: 'bg4',
    file: 'hogwarts.jpg',
    name: enTranslations['backgroundEffects.backgrounds.hogwarts'],
  },
  { id: 'bg5', file: 'library.jpg', name: enTranslations['backgroundEffects.backgrounds.library'] },
  {
    id: 'bg6',
    file: 'new-york.jpg',
    name: enTranslations['backgroundEffects.backgrounds.newYork'],
  },
  { id: 'bg7', file: 'plane.jpg', name: enTranslations['backgroundEffects.backgrounds.plane'] },
];

const mockDeleteImageFromStorage = vi.fn();
const mockGetImagesFromStorage = vi.fn(() => customImages);

vi.mock('@utils/useImageStorage/useImageStorage', () => ({
  __esModule: true,
  default: () => ({
    getImagesFromStorage: mockGetImagesFromStorage,
    deleteImageFromStorage: mockDeleteImageFromStorage,
  }),
}));

describe('BackgroundGallery', () => {
  const mockDeleteCustomImage = vi.fn();
  const mockHandleBackgroundChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBackgroundPublisherContext).mockReturnValue({
      backgroundSelected: '',
      handleBackgroundChange: mockHandleBackgroundChange,
      handleAddCustomImage: vi.fn(),
      customImages,
      deleteCustomImage: mockDeleteCustomImage,
      isPublishing: false,
      isVideoEnabled: true,
      publisher: null,
      publisherVideoElement: undefined,
      destroyBackgroundPublisher: vi.fn(),
      toggleVideo: vi.fn(),
      changeBackground: vi.fn(),
      backgroundFilter: undefined,
      localVideoSource: undefined,
      accessStatus: null,
      changeVideoSource: vi.fn(),
      initBackgroundLocalPublisher: vi.fn(),
      addCustomImage: vi.fn(),
      setBackgroundSelected: vi.fn(),
    });
  });

  it('renders all built-in backgrounds as selectable options', () => {
    render(<BackgroundGallery />);
    backgrounds.forEach((bg) => {
      expect(screen.getByTestId(`background-${bg.id}`)).toBeInTheDocument();
    });
  });

  it('renders custom images as selectable options', () => {
    render(<BackgroundGallery />);
    customImages.forEach((img) => {
      expect(screen.getByTestId(`background-${img.id}`)).toBeInTheDocument();
    });
  });

  it('sets the selected built-in background', async () => {
    render(<BackgroundGallery />);
    const duneViewOption = screen.getByTestId('background-bg3');
    await userEvent.click(duneViewOption);
    expect(mockHandleBackgroundChange).toHaveBeenCalledWith('dune-view.jpg');
  });

  it('sets the selected custom image', async () => {
    render(<BackgroundGallery />);
    const customOption = screen.getByTestId('background-custom1');
    await userEvent.click(customOption);
    expect(mockHandleBackgroundChange).toHaveBeenCalledWith('data:image/png;base64,custom1');
  });

  it('marks the built-in background as selected', () => {
    vi.mocked(useBackgroundPublisherContext).mockReturnValue({
      backgroundSelected: 'plane.jpg',
      handleBackgroundChange: mockHandleBackgroundChange,
      handleAddCustomImage: vi.fn(),
      customImages,
      deleteCustomImage: mockDeleteCustomImage,
      isPublishing: false,
      isVideoEnabled: true,
      publisher: null,
      publisherVideoElement: undefined,
      destroyBackgroundPublisher: vi.fn(),
      toggleVideo: vi.fn(),
      changeBackground: vi.fn(),
      backgroundFilter: undefined,
      localVideoSource: undefined,
      accessStatus: null,
      changeVideoSource: vi.fn(),
      initBackgroundLocalPublisher: vi.fn(),
      addCustomImage: vi.fn(),
      setBackgroundSelected: vi.fn(),
    });
    render(<BackgroundGallery />);
    const planeOption = screen.getByTestId('background-bg7');
    expect(planeOption.getAttribute('aria-pressed')).toBe('true');
  });

  it('marks the custom image as selected', () => {
    vi.mocked(useBackgroundPublisherContext).mockReturnValue({
      backgroundSelected: 'data:image/png;base64,custom2',
      handleBackgroundChange: mockHandleBackgroundChange,
      handleAddCustomImage: vi.fn(),
      customImages,
      deleteCustomImage: mockDeleteCustomImage,
      isPublishing: false,
      isVideoEnabled: true,
      publisher: null,
      publisherVideoElement: undefined,
      destroyBackgroundPublisher: vi.fn(),
      toggleVideo: vi.fn(),
      changeBackground: vi.fn(),
      backgroundFilter: undefined,
      localVideoSource: undefined,
      accessStatus: null,
      changeVideoSource: vi.fn(),
      initBackgroundLocalPublisher: vi.fn(),
      addCustomImage: vi.fn(),
      setBackgroundSelected: vi.fn(),
    });
    render(<BackgroundGallery />);
    const customOption = screen.getByTestId('background-custom2');
    expect(customOption.getAttribute('aria-pressed')).toBe('true');
  });

  it('calls onDelete when deleting a custom image', async () => {
    render(<BackgroundGallery />);
    const deleteButtons = screen.getAllByLabelText('Delete custom background');
    await userEvent.click(deleteButtons[0]);
    expect(mockDeleteCustomImage).toHaveBeenCalledWith('custom1');
  });

  it("doesn't delete custom image if it's selected", async () => {
    vi.mocked(useBackgroundPublisherContext).mockReturnValue({
      backgroundSelected: 'data:image/png;base64,custom1',
      handleBackgroundChange: mockHandleBackgroundChange,
      handleAddCustomImage: vi.fn(),
      customImages,
      deleteCustomImage: mockDeleteCustomImage,
      isPublishing: false,
      isVideoEnabled: true,
      publisher: null,
      publisherVideoElement: undefined,
      destroyBackgroundPublisher: vi.fn(),
      toggleVideo: vi.fn(),
      changeBackground: vi.fn(),
      backgroundFilter: undefined,
      localVideoSource: undefined,
      accessStatus: null,
      changeVideoSource: vi.fn(),
      initBackgroundLocalPublisher: vi.fn(),
      addCustomImage: vi.fn(),
      setBackgroundSelected: vi.fn(),
    });
    render(<BackgroundGallery />);
    const deleteButton = screen.getByTestId('background-delete-custom1');
    await userEvent.click(deleteButton);
    expect(mockDeleteCustomImage).not.toHaveBeenCalled();
  });
});
