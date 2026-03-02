import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import MemoryRouter from '@test/RouterWrapper';
import GoToLandingPageButton from './index';

describe('GoToLandingPageButton', () => {
  it('should display the correct go to landing page button', async () => {
    render(
      <MemoryRouter>
        <GoToLandingPageButton />
      </MemoryRouter>
    );

    const button = screen.getByTestId('go-to-landing-button');
    await userEvent.click(button);

    expect(screen.getByText('View Landing Page')).toBeInTheDocument();
  });
});
