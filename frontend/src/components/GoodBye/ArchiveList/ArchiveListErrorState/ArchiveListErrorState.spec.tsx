import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ArchiveListErrorState from './ArchiveListErrorState';

describe('ArchiveListErrorState', () => {
  it('renders the archives error message', () => {
    render(<ArchiveListErrorState />);

    expect(
      screen.getByText('There was an error loading recordings for this meeting')
    ).toBeVisible();
    expect(screen.getByTestId('vivid-icon-warning-line')).toBeVisible();
  });
});
