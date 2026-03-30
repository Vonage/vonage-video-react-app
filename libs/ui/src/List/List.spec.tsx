import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import List from './List';
import type { ListEntry } from './List.types';

const listMessages = {
  actionLabel: 'Download',
  emptyMessage: "The meeting hasn't been recorded",
  errorMessage: 'There was an error loading recordings for this meeting',
  errorTooltip: 'This recording failed or has expired',
};

const entries: ListEntry[] = [
  {
    id: 'pending-entry',
    status: 'pending',
    subtitle: 'Wait a few seconds to download your recording',
    title: 'We are processing your recording',
  },
  {
    downloadUrl:
      'https://example.com.com/tokbox.com.archive2.eu/46969164/c32509e3-24a9-4d1f-98a0-66a0f0fdbca6/archive.mp4',
    id: 'available-entry',
    status: 'available',
    subtitle: '0:56 • 272.0 KB • Created: Mon, Sep 2 5:09 AM',
    title: 'Recording 2',
  },
  {
    id: 'failed-entry',
    status: 'failed',
    subtitle: null,
    title: 'Recording 1',
  },
];

describe('List', () => {
  it('renders the empty state when there are no entries', () => {
    render(<List entries={[]} {...listMessages} />);

    expect(screen.getByText(listMessages.emptyMessage)).toBeVisible();
  });

  it('renders the error state when entries fail to load', () => {
    render(<List entries="error" {...listMessages} />);

    expect(screen.getByText(listMessages.errorMessage)).toBeVisible();
  });

  it('renders an action for available entries', () => {
    render(<List entries={entries} {...listMessages} />);

    const listItem = screen.getByTestId('list-item-available-entry');

    expect(within(listItem).getByTestId('list-action-button')).toBeVisible();
    expect(within(listItem).getByRole('link')).toHaveAttribute(
      'href',
      'https://example.com.com/tokbox.com.archive2.eu/46969164/c32509e3-24a9-4d1f-98a0-66a0f0fdbca6/archive.mp4'
    );
  });

  it('renders an error icon for failed entries', () => {
    render(<List entries={entries} {...listMessages} />);

    const listItem = screen.getByTestId('list-item-failed-entry');

    expect(within(listItem).getByTestId('list-error-icon')).toBeVisible();
  });

  it('renders a spinner for pending entries', () => {
    render(<List entries={entries} {...listMessages} />);

    const listItem = screen.getByTestId('list-item-pending-entry');

    expect(within(listItem).getByTestId('list-loading-spinner')).toBeVisible();
  });
});
