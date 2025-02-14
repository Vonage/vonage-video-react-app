import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LandingPageWelcome from './LandingPageWelcome';

describe('LandingPageWelcome', () => {
  it('renders the welcome heading and applies correct styling', () => {
    render(<LandingPageWelcome />);

    const textHeading = screen.getByText('Welcome to the Vonage Video React App');
    expect(textHeading).toBeInTheDocument();
    expect(textHeading).toHaveClass('w-9/12 pb-5 text-5xl font-bold text-black');
  });
});
