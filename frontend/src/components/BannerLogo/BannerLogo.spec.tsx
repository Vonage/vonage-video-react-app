import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BannerLogo from './BannerLogo';

describe('BannerLogo', () => {
  it('renders the vonage desktop logo', () => {
    render(
      <MemoryRouter>
        <BannerLogo />
      </MemoryRouter>
    );

    const vonageLogo = screen.getByAltText('Vonage-desktop-logo') as HTMLImageElement;
    expect(vonageLogo).toBeInTheDocument();
    expect(vonageLogo.src).toContain('/images/vonage-logo-desktop.svg');
  });

  it('renders the vonage mobile logo', () => {
    render(
      <MemoryRouter>
        <BannerLogo />
      </MemoryRouter>
    );

    const vonageLogo = screen.getByAltText('Vonage-mobile-logo') as HTMLImageElement;
    expect(vonageLogo).toBeInTheDocument();
    expect(vonageLogo.src).toContain('/images/vonage-logo-mobile.svg');
  });

  it('wraps logos in a Link pointing to the landing page', () => {
    render(
      <MemoryRouter>
        <BannerLogo />
      </MemoryRouter>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });
});
