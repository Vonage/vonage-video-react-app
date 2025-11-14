import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
});
