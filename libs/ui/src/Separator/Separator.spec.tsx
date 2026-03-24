import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Separator from './Separator';

describe('Separator', () => {
  it('renders the separator component', () => {
    render(<Separator />);

    expect(screen.getByTestId('separator')).toBeInTheDocument();
  });

  it('merges custom classes into the separator root element', () => {
    render(<Separator className="mr-2" />);

    expect(screen.getByTestId('separator')).toHaveClass('mr-2');
  });

  it('allows style width to override the width prop', () => {
    render(<Separator width="50%" style={{ width: '100%' }} />);

    expect(screen.getByTestId('separator')).toHaveStyle({ width: '100%' });
  });
});
