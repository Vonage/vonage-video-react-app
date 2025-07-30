import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BackgroundEffectsLayout from './BackgroundEffectsLayout';

const mockChangeBackground = vi.fn();

vi.mock('../../../hooks/usePublisherContext', () => ({
  __esModule: true,
  default: () => ({
    publisher: {
      getVideoFilter: vi.fn(() => undefined),
    },
    changeBackground: mockChangeBackground,
    isVideoEnabled: true,
  }),
}));
vi.mock('../../../hooks/useBackgroundPublisherContext', () => ({
  __esModule: true,
  default: () => ({
    publisherVideoElement: null,
    changeBackground: vi.fn(),
  }),
}));

describe('BackgroundEffectsLayout', () => {
  const handleClose = vi.fn();
  const renderLayout = (isOpen = true) =>
    render(<BackgroundEffectsLayout isOpen={isOpen} handleClose={handleClose} />);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    renderLayout();
    expect(screen.getByTestId('right-panel-title')).toHaveTextContent('Background Effects');
    expect(screen.getByTestId('background-video-container')).toBeInTheDocument();
    expect(screen.getByTestId('background-none')).toBeInTheDocument();
    expect(screen.getByTestId('background-upload')).toBeInTheDocument();
    expect(screen.getByTestId('background-bg1')).toBeInTheDocument();
    expect(screen.getAllByText(/Choose Background Effect/i)[0]).toBeInTheDocument();
    expect(screen.getByTestId('background-effect-cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('background-effect-apply-button')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = renderLayout(false);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls handleClose when Cancel is clicked', async () => {
    renderLayout();
    await userEvent.click(screen.getByTestId('background-effect-cancel-button'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls handleClose and changeBackground when Apply is clicked', async () => {
    renderLayout();
    await userEvent.click(screen.getByTestId('background-effect-apply-button'));
    expect(mockChangeBackground).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls setBackgroundSelected when effect option none is clicked', async () => {
    renderLayout();
    await userEvent.click(screen.getByTestId('background-none'));
  });

  it('calls setBackgroundSelected when a background gallery option is clicked', async () => {
    renderLayout();
    screen.debug();
    await userEvent.click(screen.getByTestId('background-bg8'));
  });
});
