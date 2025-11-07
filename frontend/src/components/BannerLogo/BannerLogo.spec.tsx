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

  it('renders clickable logo with cursor pointer', () => {
    render(
      <MemoryRouter>
        <BannerLogo />
      </MemoryRouter>
    );

    const logo = screen.getByTestId('banner-logo-image');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveStyle({ cursor: 'pointer' });
  });
});
