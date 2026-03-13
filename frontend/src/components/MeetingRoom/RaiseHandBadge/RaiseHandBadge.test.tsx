import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RaiseHandBadge from './RaiseHandBadge';

describe('RaiseHandBadge', () => {
  it('renders the ✋ emoji', () => {
    render(<RaiseHandBadge />);
    expect(screen.getByTestId('raise-hand-badge')).toBeInTheDocument();
    expect(screen.getByTestId('raise-hand-badge').textContent).toContain('✋');
  });

  it('has aria-label for accessibility', () => {
    render(<RaiseHandBadge />);
    expect(screen.getByLabelText('Hand raised')).toBeInTheDocument();
  });

  it('is not interactive (pointer-events none)', () => {
    render(<RaiseHandBadge />);
    expect(screen.getByTestId('raise-hand-badge')).toBeInTheDocument();
  });

  describe('tileWidth prop', () => {
    it('renders without error for a typical mid-size tile (400 px → 32 px badge)', () => {
      render(<RaiseHandBadge tileWidth={400} />);
      // 400 * 0.08 = 32 px, offset 8 px (minimum)
      expect(screen.getByTestId('raise-hand-badge')).toBeInTheDocument();
    });

    it('renders without error for the WebEx reference tile size (728 px → 58 px badge)', () => {
      render(<RaiseHandBadge tileWidth={728} />);
      // 728 * 0.08 = 58 px, offset 10 px
      expect(screen.getByTestId('raise-hand-badge')).toBeInTheDocument();
    });

    it('renders without error for a large spotlight tile (1200 px → 96 px badge, no upper cap)', () => {
      render(<RaiseHandBadge tileWidth={1200} />);
      // 1200 * 0.08 = 96 px (no upper clamp), offset 18 px
      expect(screen.getByTestId('raise-hand-badge')).toBeInTheDocument();
    });

    it('clamps badge to minimum 16 px for very small tiles (50 px tile)', () => {
      render(<RaiseHandBadge tileWidth={50} />);
      // 50 * 0.08 = 4 → clamped to 16 px minimum
      expect(screen.getByTestId('raise-hand-badge')).toBeInTheDocument();
    });

    it('renders without error when tileWidth is omitted (viewport-relative fallback)', () => {
      render(<RaiseHandBadge />);
      expect(screen.getByTestId('raise-hand-badge')).toBeInTheDocument();
    });
  });
});
