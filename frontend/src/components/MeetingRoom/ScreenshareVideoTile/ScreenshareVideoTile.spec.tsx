import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Box } from 'opentok-layout-js';
import ScreenshareVideoTile from './ScreenshareVideoTile';

vi.mock('../ZoomIndicator', () => ({
  default: ({
    resetZoom,
    zoomLevel,
    zoomIn,
    zoomOut,
  }: {
    resetZoom: () => void;
    zoomLevel: number;
    zoomIn: () => void;
    zoomOut: () => void;
  }) => (
    <div data-testid="zoom-indicator">
      <span data-testid="zoom-level">{zoomLevel}</span>
      <button type="button" data-testid="reset-zoom" onClick={resetZoom}>
        Reset
      </button>
      <button type="button" data-testid="zoom-in" onClick={zoomIn}>
        Zoom In
      </button>
      <button type="button" data-testid="zoom-out" onClick={zoomOut}>
        Zoom Out
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

vi.mock('../../../utils/constants', () => ({
  MAX_ZOOM: 5,
  MIN_ZOOM: 0.5,
  ZOOM_STEP: 0.25,
}));

vi.mock('@vonage/client-sdk-video', () => ({
  hasMediaProcessorSupport: vi.fn(() => true),
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

    it('zooms in when zoom in button is clicked', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const zoomLevel = screen.getByTestId('zoom-level');
      const zoomInButton = screen.getByTestId('zoom-in');

      expect(zoomLevel).toHaveTextContent('1');

      fireEvent.click(zoomInButton);
      expect(zoomLevel).toHaveTextContent('1.25');

      fireEvent.click(zoomInButton);
      expect(zoomLevel).toHaveTextContent('1.5');
    });

    it('zooms out when zoom out button is clicked', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const tile = screen.getByTestId('screenshare-tile');
      const zoomLevel = screen.getByTestId('zoom-level');
      const zoomOutButton = screen.getByTestId('zoom-out');

      fireEvent.wheel(tile, { deltaY: -100 });
      fireEvent.wheel(tile, { deltaY: -100 });
      expect(zoomLevel).toHaveTextContent('1.5');

      fireEvent.click(zoomOutButton);
      expect(zoomLevel).toHaveTextContent('1.25');

      fireEvent.click(zoomOutButton);
      expect(zoomLevel).toHaveTextContent('1');
    });

    it('handles zoomIn function correctly at boundaries', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const zoomLevel = screen.getByTestId('zoom-level');
      const zoomInButton = screen.getByTestId('zoom-in');

      for (let i = 0; i < 20; i++) {
        fireEvent.click(zoomInButton);
      }

      expect(zoomLevel).toHaveTextContent('5');
    });

    it('handles zoomOut function correctly at boundaries', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const zoomLevel = screen.getByTestId('zoom-level');
      const zoomOutButton = screen.getByTestId('zoom-out');

      for (let i = 0; i < 20; i++) {
        fireEvent.click(zoomOutButton);
      }

      expect(zoomLevel).toHaveTextContent('0.5');
    });

    it('resets pan offset when zooming back to 1x', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const tile = screen.getByTestId('screenshare-tile');
      const zoomLevel = screen.getByTestId('zoom-level');
      const zoomOutButton = screen.getByTestId('zoom-out');

      fireEvent.wheel(tile, { deltaY: -100 });
      fireEvent.mouseDown(tile, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(tile, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(tile);

      expect(zoomLevel).toHaveTextContent('1.25');

      fireEvent.click(zoomOutButton);
      expect(zoomLevel).toHaveTextContent('1');

      fireEvent.wheel(tile, { deltaY: -100 });
      expect(zoomLevel).toHaveTextContent('1.25');
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
      expect(screen.getByTestId('zoom-in')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-out')).toBeInTheDocument();
    });
  });

  describe('forwardRef functionality', () => {
    it('forwards ref correctly', () => {
      const ref = vi.fn();

      render(<ScreenshareVideoTile {...defaultProps} ref={ref} />);

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Media processor support', () => {
    it('renders ZoomIndicator when hasMediaProcessorSupport returns true', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      expect(screen.getByTestId('zoom-indicator')).toBeInTheDocument();
    });
  });

  describe('Zoom calculations', () => {
    it('handles wheel events with precise zoom calculations', () => {
      render(<ScreenshareVideoTile {...defaultProps} />);

      const tile = screen.getByTestId('screenshare-tile');
      const zoomLevel = screen.getByTestId('zoom-level');

      // Mock getBoundingClientRect for zoom calculation
      Object.defineProperty(tile, 'getBoundingClientRect', {
        writable: true,
        value: vi.fn(() => ({
          width: 800,
          height: 600,
          left: 0,
          top: 0,
        })),
      });

      expect(zoomLevel).toHaveTextContent('1');

      fireEvent.wheel(tile, {
        deltaY: -100,
        clientX: 400, // center X
        clientY: 300, // center Y
      });

      expect(zoomLevel).toHaveTextContent('1.25');
    });
  });
});
