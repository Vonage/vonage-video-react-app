import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { env } from '../../env';
import Banner from './Banner';

function renderBanner() {
  return render(
    <MemoryRouter>
      <Banner />
    </MemoryRouter>
  );
}

describe('Banner', () => {
  afterEach(() => {
    env.AUTH_ENABLED = false;
  });

  it('renders the banner logo', () => {
    renderBanner();

    expect(screen.getByTestId('banner-logo')).toBeInTheDocument();
  });

  it('hides the log out action when auth is disabled', () => {
    renderBanner();

    expect(screen.queryByTestId('banner-logout')).not.toBeInTheDocument();
  });

  it('shows the log out action when auth is enabled', () => {
    env.AUTH_ENABLED = true;

    renderBanner();

    expect(screen.getByTestId('banner-logout')).toBeInTheDocument();
  });
});
