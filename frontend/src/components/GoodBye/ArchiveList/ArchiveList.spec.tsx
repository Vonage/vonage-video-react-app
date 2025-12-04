import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import ArchiveList from './ArchiveList';
import {
  availableArchive,
  failedArchive,
  pendingArchive,
  archives as testArchives,
} from '../../../api/archiving/tests/data';

describe('ArchiveList', () => {
  it('should display message if there are no archives', () => {
    render(<ArchiveList archives={[]} />);
    expect(screen.getByText("The meeting hasn't been recorded")).toBeVisible();
  });

  it('should display message if there is an error fetching archives', () => {
    render(<ArchiveList archives="error" />);
    expect(
      screen.getByText('There was an error loading recordings for this meeting')
    ).toBeVisible();
  });

  it('should render a download button for available archives', () => {
    render(<ArchiveList archives={testArchives} />);
    const listItem = screen.getByTestId(`archive-list-item-${availableArchive.id}`);
    expect(within(listItem).getByTestId('archive-download-button')).toBeVisible();
    expect(within(listItem).getByRole('link')).toHaveAttribute(
      'href',
      'https://example.com.com/tokbox.com.archive2.eu/46969164/c32509e3-24a9-4d1f-98a0-66a0f0fdbca6/archive.mp4'
    );
  });

  it('should render an error icon for failed archives', () => {
    render(<ArchiveList archives={testArchives} />);
    const listItem = screen.getByTestId(`archive-list-item-${failedArchive.id}`);
    expect(within(listItem).getByTestId('archive-error-icon')).toBeVisible();
  });

  it('should render a spinner for pending archives', () => {
    render(<ArchiveList archives={testArchives} />);
    const listItem = screen.getByTestId(`archive-list-item-${pendingArchive.id}`);
    expect(within(listItem).getByTestId('archive-loading-spinner')).toBeVisible();
  });
});
