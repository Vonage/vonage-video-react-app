import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Banner from './Banner';

describe('Banner', () => {
  it('renders the banner logo', () => {
    render(
      <MemoryRouter>
        <Banner />
      </MemoryRouter>
    );

    const bannerLogo = screen.getByTestId('banner-logo');
    expect(bannerLogo).toBeInTheDocument();
  });

  it('renders the banner links', () => {
    render(
      <MemoryRouter>
        <Banner />
      </MemoryRouter>
    );

    const FooterLinks = screen.getByTestId('banner-links');
    expect(FooterLinks).toBeInTheDocument();
  });
});
