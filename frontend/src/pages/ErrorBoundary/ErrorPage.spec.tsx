import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import BrowserRouter from '@test/RouterWrapper';
import ErrorPage from './ErrorPage';

describe('ErrorPage', () => {
  it('should render', () => {
    render(
      <BrowserRouter>
        <ErrorPage error={new Error('Test error')} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('error-page')).toBeInTheDocument();
  });
});
