import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ArchiveDownloadLink from './ArchiveDownloadLink';

describe('ArchiveDownloadLink', () => {
  it('renders the download action for available archives', () => {
    render(<ArchiveDownloadLink url="https://example.com/archive.mp4" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com/archive.mp4');
    expect(screen.getByTestId('archive-download-button')).toBeVisible();
  });
});
