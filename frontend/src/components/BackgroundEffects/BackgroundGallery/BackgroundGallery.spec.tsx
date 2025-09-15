import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BackgroundGallery, { backgrounds } from './BackgroundGallery';

const customImages = [
  { id: 'custom1', dataUrl: 'data:image/png;base64,custom1' },
  { id: 'custom2', dataUrl: 'data:image/png;base64,custom2' },
];

const mockDeleteImageFromStorage = vi.fn();
const mockGetImagesFromStorage = vi.fn(() => customImages);

vi.mock('../../../utils/useImageStorage/useImageStorage', () => ({
  __esModule: true,
  default: () => ({
    getImagesFromStorage: mockGetImagesFromStorage,
    deleteImageFromStorage: mockDeleteImageFromStorage,
  }),
}));

describe('BackgroundGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all built-in backgrounds as selectable options', () => {
    render(
      <BackgroundGallery
        backgroundSelected=""
        setBackgroundSelected={() => {}}
        cleanPublisherBackgroundReplacementIfSelectedAndDeleted={() => {}}
      />
    );
    backgrounds.forEach((bg) => {
      expect(screen.getByTestId(`background-${bg.id}`)).toBeInTheDocument();
    });
  });

  it('renders custom images as selectable options', () => {
    render(
      <BackgroundGallery
        backgroundSelected=""
        setBackgroundSelected={() => {}}
        cleanPublisherBackgroundReplacementIfSelectedAndDeleted={() => {}}
      />
    );
    customImages.forEach((img) => {
      expect(screen.getByTestId(`background-${img.id}`)).toBeInTheDocument();
    });
  });

  it('sets the selected built-in background', async () => {
    const setBackgroundSelected = vi.fn();
    render(
      <BackgroundGallery
        backgroundSelected=""
        setBackgroundSelected={setBackgroundSelected}
        cleanPublisherBackgroundReplacementIfSelectedAndDeleted={() => {}}
      />
    );
    const duneViewOption = screen.getByTestId('background-bg3');
    await userEvent.click(duneViewOption);
    expect(setBackgroundSelected).toHaveBeenCalledWith('dune-view.jpg');
  });

  it('sets the selected custom image', async () => {
    const setBackgroundSelected = vi.fn();
    render(
      <BackgroundGallery
        backgroundSelected=""
        setBackgroundSelected={setBackgroundSelected}
        cleanPublisherBackgroundReplacementIfSelectedAndDeleted={() => {}}
      />
    );
    const customOption = screen.getByTestId('background-custom1');
    await userEvent.click(customOption);
    expect(setBackgroundSelected).toHaveBeenCalledWith('data:image/png;base64,custom1');
  });

  it('marks the built-in background as selected', () => {
    render(
      <BackgroundGallery
        backgroundSelected="plane.jpg"
        setBackgroundSelected={() => {}}
        cleanPublisherBackgroundReplacementIfSelectedAndDeleted={() => {}}
      />
    );
    const planeOption = screen.getByTestId('background-bg7');
    expect(planeOption.getAttribute('aria-pressed')).toBe('true');
  });

  it('marks the custom image as selected', () => {
    render(
      <BackgroundGallery
        backgroundSelected="data:image/png;base64,custom2"
        setBackgroundSelected={() => {}}
        cleanPublisherBackgroundReplacementIfSelectedAndDeleted={() => {}}
      />
    );
    const customOption = screen.getByTestId('background-custom2');
    expect(customOption.getAttribute('aria-pressed')).toBe('true');
  });

  it('calls deleteImageFromStorage and cleans publisher when deleting a custom image', async () => {
    const cleanPublisher = vi.fn();
    render(
      <BackgroundGallery
        backgroundSelected=""
        setBackgroundSelected={() => {}}
        cleanPublisherBackgroundReplacementIfSelectedAndDeleted={cleanPublisher}
      />
    );
    const deleteButtons = screen.getAllByLabelText('Delete custom background');
    await userEvent.click(deleteButtons[0]);
    expect(mockDeleteImageFromStorage).toHaveBeenCalledWith('custom1');
    expect(cleanPublisher).toHaveBeenCalledWith('data:image/png;base64,custom1');
  });

  it("doesn't delete custom image if it's selected", async () => {
    render(
      <BackgroundGallery
        backgroundSelected="custom1"
        setBackgroundSelected={() => {}}
        cleanPublisherBackgroundReplacementIfSelectedAndDeleted={() => {}}
      />
    );
    const deleteButton = screen.getByTestId('background-delete-custom1');
    await userEvent.click(deleteButton);
    expect(mockDeleteImageFromStorage).not.toHaveBeenCalled();
  });
});
