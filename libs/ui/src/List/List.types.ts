import type { ComponentPropsWithoutRef } from 'react';

export type ListEntryStatus = 'available' | 'pending' | 'failed';

type ListBaseEntry = {
  id: string;
  title: string;
  subtitle: string | null;
};

export type AvailableListEntry = ListBaseEntry & {
  status: 'available';
  downloadUrl: string | null;
};

export type PendingListEntry = ListBaseEntry & {
  status: 'pending';
};

export type FailedListEntry = ListBaseEntry & {
  status: 'failed';
};

export type ListEntry = AvailableListEntry | PendingListEntry | FailedListEntry;

export type ListProps = ComponentPropsWithoutRef<'div'> & {
  entries: ListEntry[] | 'error';
  actionLabel: string;
  emptyMessage: string;
  errorMessage: string;
  errorTooltip: string;
};

export type ListEmptyStateProps = {
  emptyMessage: string;
};

export type ListErrorStateProps = {
  errorMessage: string;
};

export type ListItemProps = {
  entry: ListEntry;
  entryIndex: number;
  actionLabel: string;
  errorTooltip: string;
};

export type DownloadLinkProps = {
  actionLabel: string;
  url: string | null;
};

export type ErrorIndicatorProps = {
  errorTooltip: string;
};
