import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ArchiveErrorIndicator from './ArchiveErrorIndicator';

describe('ArchiveErrorIndicator', () => {
  it('renders the error icon for failed archives', () => {
    render(<ArchiveErrorIndicator />);

    expect(screen.getByTestId('archive-error-icon')).toBeVisible();
  });
});
