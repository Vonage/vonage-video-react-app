import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Separator from './Separator';

describe('Separator', () => {
  it('renders the separator component and applies the correct class for default orientation', () => {
    render(<Separator />);

    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('mr-4');
  });

  it('applies the correct class for right orientation', () => {
    render(<Separator orientation="right" />);

    expect(screen.getByTestId('separator')).toHaveClass('ml-4');
  });
});
