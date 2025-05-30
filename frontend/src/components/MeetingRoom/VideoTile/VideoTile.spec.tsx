import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { Box } from 'opentok-layout-js';
import VideoTile, { VideoTileProps } from './VideoTile';

vi.mock('../../../utils/helpers/getBoxStyle', () => ({
  __esModule: true,
  default: (box: Box, isScreenshare: boolean) => ({
    position: 'absolute',
    width: box?.width ?? 0,
    height: box?.height ?? 0,
    border: isScreenshare ? '1px solid red' : undefined,
  }),
}));

describe('VideoTile component', () => {
  const defaultProps: VideoTileProps = {
    'data-testid': 'video-tile',
    box: { top: 10, left: 10, width: 200, height: 150 },
    children: <div>child content</div>,
    hasVideo: true,
    id: 'tile1',
  };

  it('renders correctly with given props', () => {
    const ref = createRef<HTMLDivElement>();

    render(<VideoTile {...defaultProps} ref={ref} />);

    const container = screen.getByTestId('video-tile');
    expect(container).toHaveAttribute('id', 'tile1');
    expect(container).toHaveClass('absolute', 'm-1', 'flex', 'items-center', 'justify-center');

    expect(container).toHaveStyle({
      position: 'absolute',
      width: '200px',
      height: '150px',
    });

    // Children should be rendered
    expect(screen.getByText('child content')).toBeInTheDocument();

    // The div with ref should be in the document
    expect(ref.current).not.toBeNull();

    // hasVideo true means first inner div is visible
    const hasVideoTileDiv = container.querySelector('div > div:first-child')!;
    expect(hasVideoTileDiv).not.toHaveClass('hidden');
  });

  it('hides tile when isHidden is true', () => {
    render(<VideoTile {...defaultProps} isHidden />);

    const container = screen.getByTestId('video-tile');
    expect(container).toHaveClass('hidden');
  });

  it('applies talking outline classes when isTalking is true', () => {
    render(<VideoTile {...defaultProps} isTalking />);

    const container = screen.getByTestId('video-tile');

    const hasVideoTileDiv = container.querySelector('div > div:first-child')!;
    expect(hasVideoTileDiv).toHaveClass('outline', 'outline-2', 'outline-sky-500');
  });

  it('shows fallback div when hasVideo is false', () => {
    render(<VideoTile {...defaultProps} hasVideo={false} />);

    const container = screen.getByTestId('video-tile');

    const hasVideoTileDiv = container.querySelector('div > div:first-child')!;
    const notHasVideoTileDiv = container.querySelector('div > div:last-child')!;

    expect(hasVideoTileDiv).toHaveClass('hidden');
    expect(notHasVideoTileDiv).not.toHaveClass('hidden');
  });

  it('fires onMouseEnter and onMouseLeave events', () => {
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();

    render(<VideoTile {...defaultProps} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />);

    const container = screen.getByTestId('video-tile');

    fireEvent.mouseEnter(container);
    expect(onMouseEnter).toHaveBeenCalled();

    fireEvent.mouseLeave(container);
    expect(onMouseLeave).toHaveBeenCalled();
  });

  it('applies isScreenshare styles from getBoxStyle', () => {
    render(<VideoTile {...defaultProps} isScreenshare />);

    const container = screen.getByTestId('video-tile');
    // Since getBoxStyle mock adds border for isScreenshare
    expect(container).toHaveStyle('border: 1px solid red');
  });
});
