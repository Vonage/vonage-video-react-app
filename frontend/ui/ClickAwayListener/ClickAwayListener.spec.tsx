import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ClickAwayListener from './index';

describe('ClickAwayListener', () => {
  it('renders correctly', () => {
    const handleClickAway = vi.fn();

    render(
      <ClickAwayListener onClickAway={handleClickAway}>
        <div data-testid="target-element">Click target</div>
      </ClickAwayListener>
    );

    expect(screen.getByTestId('target-element')).toBeInTheDocument();
    expect(screen.getByText('Click target')).toBeInTheDocument();
  });
});
