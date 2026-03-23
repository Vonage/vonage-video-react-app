import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import MemoryRouter from '@test/RouterWrapper';
import FooterLinks from './FooterLinks';

describe('FooterLinks', () => {
  it('renders the footer links component', () => {
    render(
      <MemoryRouter>
        <FooterLinks />
      </MemoryRouter>
    );

    const footerLinks = screen.getByTestId('footer-links');
    expect(footerLinks).toBeInTheDocument();
  });

  it('displays the app version', () => {
    render(
      <MemoryRouter>
        <FooterLinks />
      </MemoryRouter>
    );

    const versionElement = screen.getByTestId('app-version');
    expect(versionElement).toBeInTheDocument();
    expect(versionElement.textContent).toMatch(/^v\d+\.\d+\.\d+ \(SDK \d+\.\d+\.\d+\)$/);
  });
});
