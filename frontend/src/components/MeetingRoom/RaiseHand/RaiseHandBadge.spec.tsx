import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RaiseHandBadge from './RaiseHandBadge';

describe('RaiseHandBadge', () => {
  it('renders the hand icon with the given accessible label and root classes', () => {
    render(<RaiseHandBadge ariaLabel="Hand raised" className="top-0" data-testid="badge" />);

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('aria-label', 'Hand raised');
    expect(badge).toHaveClass('top-0');
    expect(badge).not.toHaveClass('top-2.5');
    expect(screen.getByTestId('vivid-icon-hand-solid')).toBeInTheDocument();
  });
});
