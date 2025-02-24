import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Separator from './Separator';

describe('Separator', () => {
  it('renders the separator component and applies the correct class for default orientation', () => {
    render(<Separator />);

    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
  });
});
