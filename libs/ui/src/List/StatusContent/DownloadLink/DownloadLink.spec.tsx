import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import DownloadLink from './DownloadLink';

describe('DownloadLink', () => {
  it('renders the action link', () => {
    render(<DownloadLink actionLabel="Download" url="https://example.com/archive.mp4" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com/archive.mp4');
    expect(screen.getByTestId('list-action-button')).toBeVisible();
  });
});
