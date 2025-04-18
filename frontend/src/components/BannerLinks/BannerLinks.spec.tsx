import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BannerLinks from './BannerLinks';

describe('BannerLinks', () => {
  it('renders the banner links component', () => {
    render(
      <MemoryRouter>
        <BannerLinks />
      </MemoryRouter>
    );

    const bannerLinks = screen.getByTestId('banner-links');
    expect(bannerLinks).toBeInTheDocument();
  });
});
