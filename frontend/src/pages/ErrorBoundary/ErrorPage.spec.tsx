import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorPage from './ErrorPage';
import { MemoryRouter } from 'react-router-dom';

describe('ErrorPage', () => {
  it('should render', () => {
    render(
      <MemoryRouter>
        <ErrorPage error={new Error('Test error')} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('error-page')).toBeInTheDocument();
  });
});
