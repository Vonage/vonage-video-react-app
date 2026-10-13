import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import UnsupportedBrowserPage from './UnsupportedBrowserPage';
import { MemoryRouter } from 'react-router-dom';

describe('UnsupportedBrowserPage', () => {
  it('should render', () => {
    render(
      <MemoryRouter>
        <UnsupportedBrowserPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Your browser is not compatible.')).toBeInTheDocument();
    expect(screen.getByText('Firefox')).toBeInTheDocument();
  });
});
