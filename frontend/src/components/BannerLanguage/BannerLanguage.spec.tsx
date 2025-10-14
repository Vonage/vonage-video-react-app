import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BannerLanguage from './BannerLanguage';

describe('BannerLanguage', () => {
  it('renders the banner language component', () => {
    render(
      <MemoryRouter>
        <BannerLanguage />
      </MemoryRouter>
    );

    const bannerLanguage = screen.getByTestId('banner-language');
    expect(bannerLanguage).toBeInTheDocument();
  });
});
