import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ArchiveStatusContent from './ArchiveStatusContent';

describe('ArchiveStatusContent', () => {
  it('renders the download action for available archives', () => {
    render(<ArchiveStatusContent status="available" url="https://example.com/archive.mp4" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com/archive.mp4');
    expect(screen.getByTestId('archive-download-button')).toBeVisible();
  });

  it('renders the loading spinner for pending archives', () => {
    render(<ArchiveStatusContent status="pending" url={null} />);

    expect(screen.getByTestId('archive-loading-spinner')).toBeVisible();
  });

  it('renders the error icon for failed archives', () => {
    render(<ArchiveStatusContent status="failed" url={null} />);

    expect(screen.getByTestId('archive-error-icon')).toBeVisible();
  });
});
