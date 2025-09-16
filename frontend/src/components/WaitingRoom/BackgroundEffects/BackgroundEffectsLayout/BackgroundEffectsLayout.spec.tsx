import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BackgroundEffectsLayout from './BackgroundEffectsLayout';

const mockChangeBackground = vi.fn();

vi.mock('../../../../hooks/usePreviewPublisherContext', () => ({
  __esModule: true,
  default: () => ({
    publisher: {
      getVideoFilter: vi.fn(() => undefined),
    },
    changeBackground: mockChangeBackground,
    isVideoEnabled: true,
  }),
}));
vi.mock('../../../../hooks/useBackgroundPublisherContext', () => ({
  __esModule: true,
  default: () => ({
    publisherVideoElement: null,
    changeBackground: vi.fn(),
  }),
}));

describe('BackgroundEffects (Waiting Room)', () => {
  const handleClose = vi.fn();
  const renderLayout = (isOpen = true) =>
    render(<BackgroundEffectsLayout isOpen={isOpen} handleClose={handleClose} />);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    renderLayout();
    expect(screen.getByTestId('background-video-container')).toBeInTheDocument();
    expect(screen.getByTestId('background-none')).toBeInTheDocument();
    expect(screen.getByTestId('background-bg1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apply/i })).toBeInTheDocument();

    // Checking that BackgroundEffectTabs (Backgrounds and Add Background tabs) are rendered
    expect(screen.getAllByText(/Backgrounds/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Add background/i)[0]).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = renderLayout(false);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls handleClose when Cancel is clicked', async () => {
    renderLayout();
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls handleClose and changeBackground when Apply is clicked', async () => {
    renderLayout();
    await userEvent.click(screen.getByRole('button', { name: /Apply/i }));
    expect(mockChangeBackground).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls setBackgroundSelected when effect option none is clicked', async () => {
    renderLayout();
    await userEvent.click(screen.getByTestId('background-none'));
  });

  it('calls setBackgroundSelected when a background gallery option is clicked', async () => {
    renderLayout();
    await userEvent.click(screen.getByTestId('background-bg8'));
  });
});
