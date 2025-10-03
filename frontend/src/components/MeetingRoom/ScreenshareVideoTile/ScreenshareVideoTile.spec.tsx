import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Box } from 'opentok-layout-js';
import ScreenshareVideoTile from './ScreenshareVideoTile';

vi.mock('../ZoomIndicator', () => ({
  default: ({ resetZoom, zoomLevel }: { resetZoom: () => void; zoomLevel: number }) => (
    <div data-testid="zoom-indicator">
      <span data-testid="zoom-level">{zoomLevel}</span>
      <button type="button" data-testid="reset-zoom" onClick={resetZoom}>
        Reset
      </button>
    </div>
  ),
}));

vi.mock('../../../utils/helpers/getBoxStyle', () => ({
  default: (box: Box | undefined) => ({
    width: box?.width || 100,
    height: box?.height || 100,
    top: box?.top || 0,
    left: box?.left || 0,
  }),
}));

describe('ScreenshareVideoTile', () => {
  const defaultProps = {
    'data-testid': 'screenshare-tile',
    box: { width: 800, height: 600, top: 0, left: 0 } as Box,
    children: <div data-testid="video-content">Video Content</div>,
    id: 'screenshare-1',
  };

  it('renders with basic props', () => {
    render(<ScreenshareVideoTile {...defaultProps} />);

    expect(screen.getByTestId('screenshare-tile')).toBeInTheDocument();
    expect(screen.getByTestId('video-content')).toBeInTheDocument();
    expect(screen.getByTestId('zoom-indicator')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<ScreenshareVideoTile {...defaultProps} className="bg-red-500" />);

    const tile = screen.getByTestId('screenshare-tile');
    expect(tile).toHaveClass('bg-red-500');
  });

  it('calls onMouseEnter and onMouseLeave handlers', () => {
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();

    render(
      <ScreenshareVideoTile
        {...defaultProps}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    );

    const tile = screen.getByTestId('screenshare-tile');

    fireEvent.mouseEnter(tile);
    expect(onMouseEnter).toHaveBeenCalledTimes(1);

    fireEvent.mouseLeave(tile);
    expect(onMouseLeave).toHaveBeenCalledTimes(1);
  });

  describe('Zoom functionality', () => {
    it('increases zoom level on wheel up', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const tile = screen.getByTestId('screenshare-tile');
      const zoomLevel = screen.getByTestId('zoom-level');

      expect(zoomLevel).toHaveTextContent('1');

      fireEvent.wheel(tile, { deltaY: -100 });
      expect(zoomLevel).toHaveTextContent('1.25');
    });

    it('decreases zoom level on wheel down', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const tile = screen.getByTestId('screenshare-tile');
      const zoomLevel = screen.getByTestId('zoom-level');

      // First zoom in
      fireEvent.wheel(tile, { deltaY: -100 });
      expect(zoomLevel).toHaveTextContent('1.25');

      // Then zoom out
      fireEvent.wheel(tile, { deltaY: 100 });
      expect(zoomLevel).toHaveTextContent('1');
    });

    it('respects minimum zoom level (0.5)', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const tile = screen.getByTestId('screenshare-tile');
      const zoomLevel = screen.getByTestId('zoom-level');

      fireEvent.wheel(tile, { deltaY: 100 });
      fireEvent.wheel(tile, { deltaY: 100 });
      fireEvent.wheel(tile, { deltaY: 100 });

      expect(zoomLevel).toHaveTextContent('0.5');
    });

    it('respects maximum zoom level (5)', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const tile = screen.getByTestId('screenshare-tile');
      const zoomLevel = screen.getByTestId('zoom-level');

      for (let i = 0; i < 20; i++) {
        fireEvent.wheel(tile, { deltaY: -100 });
      }

      expect(zoomLevel).toHaveTextContent('5');
    });

    it('resets zoom when reset button is clicked', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const tile = screen.getByTestId('screenshare-tile');
      const zoomLevel = screen.getByTestId('zoom-level');
      const resetButton = screen.getByTestId('reset-zoom');

      // Zoom in first
      fireEvent.wheel(tile, { deltaY: -100 });
      expect(zoomLevel).toHaveTextContent('1.25');

      // Reset zoom
      fireEvent.click(resetButton);
      expect(zoomLevel).toHaveTextContent('1');
    });

    it('handles wheel events and updates zoom', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const tile = screen.getByTestId('screenshare-tile');
      const zoomLevel = screen.getByTestId('zoom-level');

      expect(zoomLevel).toHaveTextContent('1');

      fireEvent.wheel(tile, { deltaY: -100 });
      expect(zoomLevel).toHaveTextContent('1.25');

      fireEvent.wheel(tile, { deltaY: 100 });
      expect(zoomLevel).toHaveTextContent('1');
    });
  });

  describe('Pan functionality', () => {
    it('enables dragging when zoomed in', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const tile = screen.getByTestId('screenshare-tile');

      fireEvent.wheel(tile, { deltaY: -100 });

      fireEvent.mouseDown(tile, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(tile, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(tile);

      expect(tile).toBeInTheDocument();
    });

    it('does not enable dragging when zoom level is 1', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const tile = screen.getByTestId('screenshare-tile');

      fireEvent.mouseDown(tile, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(tile, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(tile);

      expect(tile).toBeInTheDocument();
    });

    it('stops dragging on mouse leave', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const tile = screen.getByTestId('screenshare-tile');

      fireEvent.wheel(tile, { deltaY: -100 });
      fireEvent.mouseDown(tile, { clientX: 100, clientY: 100 });

      fireEvent.mouseLeave(tile);

      expect(tile).toBeInTheDocument();
    });
  });

  describe('Box styling', () => {
    it('renders with undefined box', () => {
      render(<ScreenshareVideoTile {...defaultProps} box={undefined} />);

      expect(screen.getByTestId('screenshare-tile')).toBeInTheDocument();
    });

    it('applies box dimensions as styles', () => {
      const customBox = { width: 400, height: 300, top: 50, left: 25 } as Box;

      render(<ScreenshareVideoTile {...defaultProps} box={customBox} />);

      const tile = screen.getByTestId('screenshare-tile');
      expect(tile).toBeInTheDocument();
    });
  });

  describe('Component structure', () => {
    it('has correct CSS classes', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const tile = screen.getByTestId('screenshare-tile');
      expect(tile).toHaveClass('absolute', 'm-1', 'flex', 'items-center', 'justify-center');
    });

    it('has correct id attribute', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const tile = screen.getByTestId('screenshare-tile');
      expect(tile).toHaveAttribute('id', 'screenshare-1');
    });

    it('renders children content', () => {
      const customChildren = (
        <div data-testid="custom-content">
          <span>Custom Video Element</span>
        </div>
      );

      render(<ScreenshareVideoTile {...defaultProps}>{customChildren}</ScreenshareVideoTile>);

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Custom Video Element')).toBeInTheDocument();
    });

    it('renders ZoomIndicator with correct props', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      expect(screen.getByTestId('zoom-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('1');
      expect(screen.getByTestId('reset-zoom')).toBeInTheDocument();
    });
  });

  describe('forwardRef functionality', () => {
    it('forwards ref correctly', () => {
      const ref = vi.fn();

      render(<ScreenshareVideoTile {...defaultProps} ref={ref} />);

      expect(ref).toHaveBeenCalled();
    });
  });
});
