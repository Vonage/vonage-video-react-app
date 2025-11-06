import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FlexLayout from './FlexLayout';

describe('FlexLayout', () => {
  it('renders correctly', () => {
    render(<FlexLayout>Grid</FlexLayout>);

    const flexLayout = screen.getByRole('FlexLayout', { name: 'Grid' });
    expect(flexLayout).toBeInTheDocument();
  });
});
