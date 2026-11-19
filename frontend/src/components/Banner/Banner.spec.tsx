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
    document.cookie = 'vera-session-signed-in=; max-age=0';
  });

  it('renders the banner logo', () => {
    renderBanner();

    expect(screen.getByTestId('banner-logo')).toBeInTheDocument();
  });

  it.each([
    { scenario: 'auth is disabled', isAuthEnabled: false, cookie: '', isShown: false },
    { scenario: 'nobody is signed in', isAuthEnabled: true, cookie: '', isShown: false },
    {
      scenario: 'signed in',
      isAuthEnabled: true,
      cookie: 'vera-session-signed-in=1',
      isShown: true,
    },
  ])('shows the log out action: $isShown when $scenario', ({ isAuthEnabled, cookie, isShown }) => {
    env.AUTH_ENABLED = isAuthEnabled;
    document.cookie = cookie;

    renderBanner();

    expect(!!screen.queryByTestId('banner-logout')).toBe(isShown);
  });
});
