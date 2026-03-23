import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { availableArchive, pendingArchive } from '../../../../api/archiving/tests/data';
import ArchiveListItem from './ArchiveListItem';

describe('ArchiveListItem', () => {
  it('renders archive metadata for available archives', () => {
    render(<ArchiveListItem archive={availableArchive} archiveCount={2} archiveIndex={0} />);

    expect(screen.getByTestId(`archive-list-item-${availableArchive.id}`)).toBeVisible();
    expect(screen.getByText(/recording 2/i)).toBeVisible();
    expect(screen.getByText(/created:/i)).toBeVisible();
  });

  it('renders the loading subtitle for pending archives', () => {
    render(<ArchiveListItem archive={pendingArchive} archiveCount={1} archiveIndex={0} />);

    expect(screen.getByText('We are processing your recording')).toBeVisible();
    expect(screen.getByText('Wait a few seconds to download your recording')).toBeVisible();
  });
});
