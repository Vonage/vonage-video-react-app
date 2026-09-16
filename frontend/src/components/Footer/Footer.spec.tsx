import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

describe('Footer', () => {
  it('renders the footer content', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const footerLinks = screen.getByTestId('footer-content');
    expect(footerLinks).toBeInTheDocument();
  });
});
