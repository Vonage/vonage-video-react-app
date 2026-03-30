import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ListErrorState from './ListErrorState';

describe('ListErrorState', () => {
  it('renders the error message', () => {
    render(
      <ListErrorState errorMessage="There was an error loading recordings for this meeting" />
    );

    expect(
      screen.getByText('There was an error loading recordings for this meeting')
    ).toBeVisible();
    expect(screen.getByTestId('vivid-icon-warning-line')).toBeVisible();
  });
});
