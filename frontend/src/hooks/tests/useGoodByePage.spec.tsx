import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import useGoodByePage from '../useGoodByePage';
import useArchives from '../useArchives';
import { useLocation, useParams } from 'react-router-dom';
import { availableArchive } from '../../api/archiving/tests/data';

vi.mock('../useArchives');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(() => ({ state: null, search: '', pathname: '/goodbye', hash: '' })),
    useParams: vi.fn(() => ({ roomIdentifier: 'my-session-key' })),
  };
});

const mockUseArchives = useArchives as Mock;
const mockUseParams = useParams as Mock;
const mockUseLocation = useLocation as Mock;

describe('useGoodByePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ roomIdentifier: 'my-session-key' });
    mockUseArchives.mockReturnValue([]);
  });

  it('returns the sessionKey from URL params', () => {
    const { result } = renderHook(() => useGoodByePage());
    expect(result.current.sessionKey).toBe('my-session-key');
  });

  it('passes sessionKey to useArchives', () => {
    renderHook(() => useGoodByePage());
    expect(mockUseArchives).toHaveBeenCalledWith({ sessionKey: 'my-session-key' });
  });

  it('forwards archives from useArchives', () => {
    mockUseArchives.mockReturnValue([availableArchive]);

    const { result } = renderHook(() => useGoodByePage());
    expect(result.current.archives).toEqual([availableArchive]);
  });

  it('forwards "error" from useArchives when archives fail to load', () => {
    mockUseArchives.mockReturnValue('error');

    const { result } = renderHook(() => useGoodByePage());
    expect(result.current.archives).toBe('error');
  });

  it('uses location.state header when provided', () => {
    mockUseLocation.mockReturnValue({
      state: { header: 'Custom Header', caption: 'Custom Caption' },
    });

    const { result } = renderHook(() => useGoodByePage());
    expect(result.current.header).toBe('Custom Header');
    expect(result.current.caption).toBe('Custom Caption');
  });

  it('falls back to default i18n header when location.state is null', () => {
    mockUseLocation.mockReturnValue({ state: null });

    const { result } = renderHook(() => useGoodByePage());
    expect(typeof result.current.header).toBe('string');
    expect(result.current.header.length).toBeGreaterThan(0);
  });

  it('falls back to default i18n caption when location.state has no caption', () => {
    mockUseLocation.mockReturnValue({ state: { header: 'Some Header' } });

    const { result } = renderHook(() => useGoodByePage());
    expect(typeof result.current.caption).toBe('string');
    expect(result.current.caption.length).toBeGreaterThan(0);
  });
});
