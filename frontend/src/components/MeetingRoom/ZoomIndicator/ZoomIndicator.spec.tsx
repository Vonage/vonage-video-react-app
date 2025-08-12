import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ZoomIndicator from './ZoomIndicator';

describe('ZoomIndicator', () => {
  const mockResetZoom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    render(<ZoomIndicator zoomLevel={1} resetZoom={mockResetZoom} />);

    const icon = screen.getByTestId('ZoomInOutlinedIcon');

    expect(icon).toBeInTheDocument();
    expect(screen.queryByText('100%')).not.toBeInTheDocument();
  });

  it('clicking button calls reset zoom', async () => {
    render(<ZoomIndicator zoomLevel={1} resetZoom={mockResetZoom} />);

    const zoomIndicatorButton = screen.getByTestId('zoom-indicator-button');

    await userEvent.click(zoomIndicatorButton);
    expect(mockResetZoom).toHaveBeenCalled();
  });

  it('displays correct icon and text depending on zoom-level', async () => {
    const { rerender } = render(<ZoomIndicator zoomLevel={1.25} resetZoom={mockResetZoom} />);

    const zoomOutIcon = screen.getByTestId('ZoomOutOutlinedIcon');
    const zoomLevelText = screen.getByTestId('zoom-indicator-text');

    expect(zoomOutIcon).toBeInTheDocument();
    expect(zoomLevelText).toHaveTextContent('125%');

    rerender(<ZoomIndicator zoomLevel={1} resetZoom={mockResetZoom} />);
    expect(zoomOutIcon).not.toBeInTheDocument();
    const zoomInIcon = screen.getByTestId('ZoomInOutlinedIcon');
    expect(zoomInIcon).toBeInTheDocument();
    expect(zoomLevelText).not.toBeInTheDocument();
  });
});
