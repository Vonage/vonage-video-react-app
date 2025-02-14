import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import JoinContainerSeparator from './JoinContainerSeparator';

describe('JoinContainerSeparator', () => {
  it('renders the component with separators and text and applies correct styling', () => {
    render(<JoinContainerSeparator />);

    expect(screen.getByText('or')).toBeInTheDocument();

    const separators = screen.getAllByTestId('separator');
    expect(separators).toHaveLength(2);

    expect(screen.getByTestId('separator').parentElement).toHaveClass('flex w-full items-center');
  });
});
