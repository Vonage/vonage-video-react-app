import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { GestureName } from '../../../hooks/useGestureDetection';
import GestureProgressRing from './GestureProgressRing';

describe('GestureProgressRing', () => {
  const baseProps = {
    gesture: 'Open_Palm' as const,
    state: 'detecting' as const,
    durationMs: 2000,
    tileWidth: 800,
  };

  it('renders the matching emoji for each tracked gesture', () => {
    const cases: Array<[GestureName, string]> = [
      ['Open_Palm', '✋'],
      ['Thumb_Up', '👍'],
      ['Thumb_Down', '👎'],
    ];

    for (const [gesture, emoji] of cases) {
      const { unmount } = render(<GestureProgressRing {...baseProps} gesture={gesture} />);
      expect(screen.getByTestId('gesture-progress-ring').textContent).toContain(emoji);
      unmount();
    }
  });

  it('scales the ring to ~20% of tile width with a 64px floor', () => {
    const { rerender } = render(<GestureProgressRing {...baseProps} tileWidth={800} />);
    let svg = screen.getByTestId('gesture-progress-ring').querySelector('svg')!;
    // 20% of 800 = 160
    expect(svg.getAttribute('width')).toBe('160');
    expect(svg.getAttribute('height')).toBe('160');

    // Tiny tile: clamp to 64px floor.
    rerender(<GestureProgressRing {...baseProps} tileWidth={100} />);
    svg = screen.getByTestId('gesture-progress-ring').querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('64');
  });

  it('runs the fill animation for the configured duration while detecting', () => {
    render(<GestureProgressRing {...baseProps} state="detecting" durationMs={1500} />);
    // The progress (foreground) circle is the second of the two circles in the SVG.
    const circles = screen.getByTestId('gesture-progress-ring').querySelectorAll('circle');
    expect(circles).toHaveLength(2);
    const progressCircle = circles[1];
    expect(progressCircle.getAttribute('style')).toContain(
      'animation: gesture-ring-fill 1500ms linear forwards'
    );
  });

  it('snaps to fully filled (no animation) when state is completed', () => {
    render(<GestureProgressRing {...baseProps} state="completed" />);
    const circles = screen.getByTestId('gesture-progress-ring').querySelectorAll('circle');
    const progressCircle = circles[1];
    expect(progressCircle.getAttribute('stroke-dashoffset')).toBe('0');
    expect(progressCircle.getAttribute('style') ?? '').not.toContain('animation:');
  });

  it('decorates the ring as presentational so screen readers ignore it', () => {
    render(<GestureProgressRing {...baseProps} />);
    const ring = screen.getByTestId('gesture-progress-ring');
    expect(ring.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    // The emoji span carries role="img" but is also aria-hidden — the gesture
    // is announced via the resulting action (raise hand / emoji), not the ring.
    const emoji = ring.querySelector('[role="img"]')!;
    expect(emoji).toHaveAttribute('aria-hidden', 'true');
  });
});
