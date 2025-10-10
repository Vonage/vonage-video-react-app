import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ZoomIndicator from './ZoomIndicator';
import { MAX_ZOOM, MIN_ZOOM } from '../../../utils/constants';

describe('ZoomIndicator', () => {
  const mockResetZoom = vi.fn();
  const mockZoomIn = vi.fn();
  const mockZoomOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly at 100% zoom', async () => {
    render(
      <ZoomIndicator
        zoomLevel={1}
        resetZoom={mockResetZoom}
        zoomIn={mockZoomIn}
        zoomOut={mockZoomOut}
      />
    );

    const icon = screen.getByTestId('ZoomInOutlinedIcon');
    const mainButton = screen.getByTestId('zoom-indicator-button');

    expect(icon).toBeInTheDocument();
    expect(mainButton).toBeInTheDocument();
    expect(screen.queryByText('100%')).not.toBeInTheDocument();
    expect(screen.queryByTestId('zoom-out-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('zoom-in-button')).not.toBeInTheDocument();
  });

  it('clicking main button calls zoomIn when at 100% zoom', async () => {
    render(
      <ZoomIndicator
        zoomLevel={1}
        resetZoom={mockResetZoom}
        zoomIn={mockZoomIn}
        zoomOut={mockZoomOut}
      />
    );

    const zoomIndicatorButton = screen.getByTestId('zoom-indicator-button');

    await userEvent.click(zoomIndicatorButton);
    expect(mockZoomIn).toHaveBeenCalledOnce();
    expect(mockResetZoom).not.toHaveBeenCalled();
  });

  it('clicking main button calls resetZoom when zoomed', async () => {
    render(
      <ZoomIndicator
        zoomLevel={1.25}
        resetZoom={mockResetZoom}
        zoomIn={mockZoomIn}
        zoomOut={mockZoomOut}
      />
    );

    const zoomIndicatorButton = screen.getByTestId('zoom-indicator-button');

    await userEvent.click(zoomIndicatorButton);
    expect(mockResetZoom).toHaveBeenCalledOnce();
    expect(mockZoomIn).not.toHaveBeenCalled();
  });

  it('displays correct icon and text depending on zoom-level', async () => {
    const { rerender } = render(
      <ZoomIndicator
        zoomLevel={1.25}
        resetZoom={mockResetZoom}
        zoomIn={mockZoomIn}
        zoomOut={mockZoomOut}
      />
    );

    const zoomOutIcon = screen.getByTestId('ZoomOutOutlinedIcon');
    const zoomLevelText = screen.getByTestId('zoom-level');
    const zoomOutButton = screen.getByTestId('zoom-out-button');
    const zoomInButton = screen.getByTestId('zoom-in-button');

    expect(zoomOutIcon).toBeInTheDocument();
    expect(zoomLevelText).toHaveTextContent('125%');
    expect(zoomOutButton).toBeInTheDocument();
    expect(zoomInButton).toBeInTheDocument();

    rerender(
      <ZoomIndicator
        zoomLevel={1}
        resetZoom={mockResetZoom}
        zoomIn={mockZoomIn}
        zoomOut={mockZoomOut}
      />
    );

    expect(screen.queryByTestId('ZoomOutOutlinedIcon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('zoom-level')).not.toBeInTheDocument();
    expect(screen.queryByTestId('zoom-out-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('zoom-in-button')).not.toBeInTheDocument();

    const zoomInIcon = screen.getByTestId('ZoomInOutlinedIcon');
    expect(zoomInIcon).toBeInTheDocument();
  });

  it('zoom in and zoom out buttons work correctly', async () => {
    render(
      <ZoomIndicator
        zoomLevel={2}
        resetZoom={mockResetZoom}
        zoomIn={mockZoomIn}
        zoomOut={mockZoomOut}
      />
    );

    const zoomInButton = screen.getByTestId('zoom-in-button');
    const zoomOutButton = screen.getByTestId('zoom-out-button');

    await userEvent.click(zoomInButton);
    expect(mockZoomIn).toHaveBeenCalledOnce();

    await userEvent.click(zoomOutButton);
    expect(mockZoomOut).toHaveBeenCalledOnce();
  });

  it('disables zoom buttons at limits', async () => {
    const { rerender } = render(
      <ZoomIndicator
        zoomLevel={MIN_ZOOM}
        resetZoom={mockResetZoom}
        zoomIn={mockZoomIn}
        zoomOut={mockZoomOut}
      />
    );

    let zoomOutButton = screen.getByTestId('zoom-out-button');
    let zoomInButton = screen.getByTestId('zoom-in-button');

    expect(zoomOutButton).toBeDisabled();
    expect(zoomInButton).not.toBeDisabled();

    rerender(
      <ZoomIndicator
        zoomLevel={MAX_ZOOM}
        resetZoom={mockResetZoom}
        zoomIn={mockZoomIn}
        zoomOut={mockZoomOut}
      />
    );

    zoomOutButton = screen.getByTestId('zoom-out-button');
    zoomInButton = screen.getByTestId('zoom-in-button');

    expect(zoomOutButton).not.toBeDisabled();
    expect(zoomInButton).toBeDisabled();
  });

  it('shows correct percentage values', async () => {
    const testCases = [
      { zoomLevel: MIN_ZOOM, expectedText: '50%' },
      { zoomLevel: 1.25, expectedText: '125%' },
      { zoomLevel: 2, expectedText: '200%' },
      { zoomLevel: 3.33, expectedText: '333%' },
    ];

    testCases.forEach(({ zoomLevel, expectedText }) => {
      const { unmount } = render(
        <ZoomIndicator
          zoomLevel={zoomLevel}
          resetZoom={mockResetZoom}
          zoomIn={mockZoomIn}
          zoomOut={mockZoomOut}
        />
      );

      const zoomText = screen.getByTestId('zoom-level');
      expect(zoomText).toHaveTextContent(expectedText);

      unmount();
    });
  });

  it('has correct tooltip titles', async () => {
    const { rerender } = render(
      <ZoomIndicator
        zoomLevel={1}
        resetZoom={mockResetZoom}
        zoomIn={mockZoomIn}
        zoomOut={mockZoomOut}
      />
    );

    const mainButton = screen.getByTestId('zoom-indicator-button');
    expect(mainButton.closest('[title]')).toBeNull();

    rerender(
      <ZoomIndicator
        zoomLevel={1.5}
        resetZoom={mockResetZoom}
        zoomIn={mockZoomIn}
        zoomOut={mockZoomOut}
      />
    );

    const zoomOutButton = screen.getByTestId('zoom-out-button');
    const zoomInButton = screen.getByTestId('zoom-in-button');

    expect(zoomOutButton).toBeInTheDocument();
    expect(zoomInButton).toBeInTheDocument();
  });
});
