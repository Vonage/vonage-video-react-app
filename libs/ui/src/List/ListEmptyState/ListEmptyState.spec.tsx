import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ListEmptyState from './ListEmptyState';

describe('ListEmptyState', () => {
  it('renders the empty message', () => {
    render(<ListEmptyState emptyMessage="The meeting hasn't been recorded" />);

    expect(screen.getByTestId('list-empty-state')).toBeVisible();
    expect(screen.getByText("The meeting hasn't been recorded")).toBeVisible();
  });
});
