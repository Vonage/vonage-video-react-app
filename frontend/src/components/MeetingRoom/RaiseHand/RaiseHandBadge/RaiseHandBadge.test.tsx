import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RaiseHandBadge from './RaiseHandBadge';

describe('RaiseHandBadge', () => {
  it('renders the ✋ emoji from the central emojiMap', () => {
    render(<RaiseHandBadge />);
    expect(screen.getByTestId('raise-hand-badge').textContent).toContain('✋');
  });

  it('exposes "Hand raised" as the accessible name and hides the emoji from AT', () => {
    render(<RaiseHandBadge />);
    const badge = screen.getByLabelText('Hand raised');
    expect(badge).toBe(screen.getByTestId('raise-hand-badge'));
    // The emoji span is decorative — assistive tech should announce the
    // aria-label, not the codepoint.
    expect(badge.querySelector('[role="img"]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('is non-interactive (no pointer events, animates in)', () => {
    render(<RaiseHandBadge />);
    const badge = screen.getByTestId('raise-hand-badge');
    expect(badge.className).toContain('pointer-events-none');
    expect(badge.className).toContain('animate-raise-hand-in');
  });

  describe('tileWidth → badge sizing', () => {
    it('uses the viewport-relative fallback when tileWidth is omitted', () => {
      render(<RaiseHandBadge />);
      const badge = screen.getByTestId('raise-hand-badge');
      expect(badge).toHaveStyle({ fontSize: 'clamp(16px, 3vw, 96px)' });
      expect(badge).toHaveStyle({ bottom: '12px', right: '12px' });
    });

    it.each([
      // tile width, expected font-size px, expected offset px
      [400, 32, 8],
      [728, 58, 11],
      [1200, 96, 18],
    ])('scales proportionally for a %i px tile', (tileWidth, expectedFont, expectedOffset) => {
      render(<RaiseHandBadge tileWidth={tileWidth} />);
      const badge = screen.getByTestId('raise-hand-badge');
      expect(badge).toHaveStyle({ fontSize: `${expectedFont}px` });
      expect(badge).toHaveStyle({ bottom: `${expectedOffset}px`, right: `${expectedOffset}px` });
    });

    it('clamps to a 16 px font / 8 px offset on tiny tiles', () => {
      render(<RaiseHandBadge tileWidth={50} />);
      const badge = screen.getByTestId('raise-hand-badge');
      // 50 * 0.08 = 4 → clamped to 16, 50 * 0.015 = 0.75 → clamped to 8
      expect(badge).toHaveStyle({ fontSize: '16px' });
      expect(badge).toHaveStyle({ bottom: '8px', right: '8px' });
    });
  });
});
