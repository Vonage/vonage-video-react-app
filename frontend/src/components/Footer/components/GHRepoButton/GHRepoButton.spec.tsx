import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import GHRepoButton from './GHRepoButton';

describe('GHRepoButton', () => {
  it('renders a link to the GitHub repo', () => {
    render(
      <MemoryRouter>
        <GHRepoButton />
      </MemoryRouter>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://github.com/Vonage/vonage-video-react-app/');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders a tooltip with the correct title', async () => {
    render(<GHRepoButton />);
    const button = screen.getByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByText('Visit our GitHub Repo');
    expect(tooltip).toBeInTheDocument();
  });

  it('renders the GitHub icon', () => {
    render(<GHRepoButton />);
    const icon = screen.getByTestId('vivid-icon-github-mono');
    expect(icon).toBeInTheDocument();
  });
});
