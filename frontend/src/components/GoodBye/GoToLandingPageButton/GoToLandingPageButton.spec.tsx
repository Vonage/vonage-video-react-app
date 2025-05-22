import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import GoToLandingPageButton from './index';

describe('GoToLandingPageButton', () => {
  it('should display the correct go to landing page button', async () => {
    const mockFn = vi.fn();

    render(<GoToLandingPageButton handleLanding={mockFn} />);

    // Use user-event to simulate click
    const button = screen.getByTestId('go-to-landing-button');
    await userEvent.click(button);

    // Check button is correctly displayed
    expect(screen.getByText('Return to landing page')).toBeInTheDocument();
    expect(mockFn).toHaveBeenCalled();
  });
});
