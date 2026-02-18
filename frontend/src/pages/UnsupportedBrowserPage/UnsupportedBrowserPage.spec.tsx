import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import BrowserRouter from '@test/RouterWrapper';
import UnsupportedBrowserPage from './UnsupportedBrowserPage';

describe('UnsupportedBrowserPage', () => {
  it('should render', () => {
    render(
      <BrowserRouter>
        <UnsupportedBrowserPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Your browser is not compatible.')).toBeInTheDocument();
    expect(screen.getByText('Firefox')).toBeInTheDocument();
  });
});
