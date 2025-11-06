import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LandingPageWelcome from './LandingPageWelcome';

describe('LandingPageWelcome', () => {
  it('renders the welcome heading and applies correct styling', () => {
    render(<LandingPageWelcome />);

    const textHeading = screen.getByText(
      'Power your business with video that transforms customer satisfaction.'
    );
    expect(textHeading).toBeInTheDocument();
  });
});
