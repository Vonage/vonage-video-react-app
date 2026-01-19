import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Example from './Example';

describe('Example', () => {
  it('renders the header', () => {
    render(<Example />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Vera Room');
    expect(screen.getByText('Embeddable Video Conferencing Web Component')).toBeInTheDocument();
  });

  it('renders the Live Example section', () => {
    render(<Example />);

    expect(screen.getByRole('heading', { name: 'Live Example' })).toBeInTheDocument();
  });

  it('renders the Usage section', () => {
    render(<Example />);

    expect(screen.getByRole('heading', { name: 'Usage' })).toBeInTheDocument();
    expect(
      screen.getByText('Add the script to your page and use the custom element:')
    ).toBeInTheDocument();
  });

  it('renders the Styling the Container section', () => {
    render(<Example />);

    expect(screen.getByRole('heading', { name: 'Styling the Container' })).toBeInTheDocument();
  });
});
