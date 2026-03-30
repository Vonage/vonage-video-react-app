import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import LoadingIndicator from './LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders the loading spinner', () => {
    render(<LoadingIndicator />);

    expect(screen.getByTestId('list-loading-spinner')).toBeVisible();
  });
});
