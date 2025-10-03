import { describe, expect, it } from 'vitest';
import { createArchiveFromServer, hasPending } from '../model';
import { availableServerArchive, failedServerArchive, startedServerArchive } from './data';

describe('createArchiveFromServer', () => {
  it('should convert fields to model fields', () => {
    const archive = createArchiveFromServer('en', availableServerArchive);
    expect(archive).toEqual({
      createdAt: 1725268141000,
      createdAtFormatted: 'Mon, Sep 2 5:09 AM',
      id: 'c32509e3-24a9-4d1f-98a0-66a0f0fdbca6',
      status: 'available',
      url: 'https://example.com.com/tokbox.com.archive2.eu/46969164/c32509e3-24a9-4d1f-98a0-66a0f0fdbca6/archive.mp4',
    });
  });

  it('should return status as failed for failed and expired archives', () => {
    expect(createArchiveFromServer('en', failedServerArchive).status).toBe('failed');
    expect(
      createArchiveFromServer('en', { ...failedServerArchive, status: 'expired' }).status
    ).toBe('failed');
  });

  it('should return available as failed for status available archives', () => {
    expect(createArchiveFromServer('en', availableServerArchive).status).toBe('available');
  });

  it('should return status as pending for started, stopped, uploaded, and paused archives', () => {
    expect(createArchiveFromServer('en', startedServerArchive).status).toBe('pending');
    expect(
      createArchiveFromServer('en', { ...startedServerArchive, status: 'stopped' }).status
    ).toBe('pending');
    expect(
      createArchiveFromServer('en', { ...startedServerArchive, status: 'uploaded' }).status
    ).toBe('pending');
    expect(
      createArchiveFromServer('en', { ...startedServerArchive, status: 'paused' }).status
    ).toBe('pending');
  });
});

describe('hasPending', () => {
  it('should return true if any archive is pending', () => {
    expect(
      hasPending([
        {
          id: '1',
          url: 'example.com',
          status: 'available',
          createdAt: 1725268141000,
          createdAtFormatted: 'Mon, Sep 2 5:09 AM',
        },
        {
          id: '1',
          url: 'example.com',
          status: 'pending',
          createdAt: 1725268141000,
          createdAtFormatted: 'Mon, Sep 2 5:09 AM',
        },
        {
          id: '1',
          url: 'example.com',
          status: 'available',
          createdAt: 1725268141000,
          createdAtFormatted: 'Mon, Sep 2 5:09 AM',
        },
      ])
    ).toBe(true);
  });
  it('should return false if no archives are pending', () => {
    expect(
      hasPending([
        {
          id: '1',
          url: 'example.com',
          status: 'available',
          createdAt: 1725268141000,
          createdAtFormatted: 'Mon, Sep 2 5:09 AM',
        },
        {
          id: '1',
          url: 'example.com',
          status: 'failed',
          createdAt: 1725268141000,
          createdAtFormatted: 'Mon, Sep 2 5:09 AM',
        },
        {
          id: '1',
          url: 'example.com',
          status: 'available',
          createdAt: 1725268141000,
          createdAtFormatted: 'Mon, Sep 2 5:09 AM',
        },
      ])
    ).toBe(false);
  });
});
