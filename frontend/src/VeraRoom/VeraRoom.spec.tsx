import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VeraRoom from './VeraRoom';

describe('VeraRoom', () => {
  it('renders correctly', () => {
    render(<VeraRoom data-testid="vera-room" />);

    const veraRoom = screen.getByTestId('vera-room');
    expect(veraRoom).toBeInTheDocument();
    expect(veraRoom).toHaveClass('VeraRoom');
  });

  it('applies custom className', () => {
    // eslint-disable-next-line tailwindcss/no-custom-classname
    render(<VeraRoom data-testid="vera-room" className="custom-class" />);

    const veraRoom = screen.getByTestId('vera-room');
    expect(veraRoom).toHaveClass('VeraRoom');
    expect(veraRoom).toHaveClass('custom-class');
  });

  it('passes additional props to the container', () => {
    render(<VeraRoom data-testid="vera-room" id="test-id" />);

    const veraRoom = screen.getByTestId('vera-room');
    expect(veraRoom).toHaveAttribute('id', 'test-id');
  });
});
