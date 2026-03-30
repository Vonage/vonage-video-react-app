import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ListEntry } from '../List.types';
import ListItem from './ListItem';

const availableEntry: ListEntry = {
  downloadUrl: 'https://example.com/archive.mp4',
  id: 'available-entry',
  status: 'available',
  subtitle: '0:56 • 272.0 KB • Created: Mon, Sep 2 5:09 AM',
  title: 'Recording 2',
};

const pendingEntry: ListEntry = {
  id: 'pending-entry',
  status: 'pending',
  subtitle: 'Wait a few seconds to download your recording',
  title: 'We are processing your recording',
};

describe('ListItem', () => {
  it('renders metadata for available entries', () => {
    render(
      <ListItem
        actionLabel="Download"
        entry={availableEntry}
        entryIndex={0}
        errorTooltip="This recording failed or has expired"
      />
    );

    expect(screen.getByTestId('list-item-available-entry')).toBeVisible();
    expect(screen.getByText(/recording 2/i)).toBeVisible();
    expect(screen.getByText(/created:/i)).toBeVisible();
  });

  it('renders the pending subtitle and state class', () => {
    render(
      <ListItem
        actionLabel="Download"
        entry={pendingEntry}
        entryIndex={0}
        errorTooltip="This recording failed or has expired"
      />
    );

    expect(screen.getByText('We are processing your recording')).toBeVisible();
    expect(screen.getByText('Wait a few seconds to download your recording')).toBeVisible();
    expect(screen.getByTestId('list-item-title-0')).toHaveClass('pending');
  });
});
