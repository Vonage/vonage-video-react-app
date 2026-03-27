import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ArchiveLoadingIndicator from './ArchiveLoadingIndicator';

describe('ArchiveLoadingIndicator', () => {
  it('renders the loading spinner for pending archives', () => {
    render(<ArchiveLoadingIndicator />);

    expect(screen.getByTestId('archive-loading-spinner')).toBeVisible();
  });
});
