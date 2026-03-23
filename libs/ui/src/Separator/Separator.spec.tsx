import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Separator from './Separator';

describe('Separator', () => {
  it('renders the separator component', () => {
    render(<Separator />);

    expect(screen.getByTestId('separator')).toBeInTheDocument();
  });

  it('applies right spacing when orientation is right', () => {
    render(<Separator orientation="right" />);

    expect(screen.getByTestId('separator')).toHaveClass('ml-2');
  });
});
