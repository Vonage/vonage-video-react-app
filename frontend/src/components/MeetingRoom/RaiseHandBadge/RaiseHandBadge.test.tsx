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
    const badge = screen.getByTestId('raise-hand-badge');
    expect(badge).toBeInTheDocument();
  });
});
