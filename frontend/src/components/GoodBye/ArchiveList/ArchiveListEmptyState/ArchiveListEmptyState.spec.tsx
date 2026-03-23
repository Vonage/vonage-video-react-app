import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ArchiveListEmptyState from './ArchiveListEmptyState';

describe('ArchiveListEmptyState', () => {
  it('renders the empty archives message', () => {
    render(<ArchiveListEmptyState />);

    expect(screen.getByTestId('archive-list-empty')).toBeVisible();
    expect(screen.getByText("The meeting hasn't been recorded")).toBeVisible();
  });
});
