import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import useGoodByePage from '../useGoodByePage';
import useArchives from '../useArchives';
import useRoomName from '../useRoomName';
import { useLocation } from 'react-router-dom';
import { availableArchive } from '../../api/archiving/tests/data';

vi.mock('../useArchives');
vi.mock('../useRoomName');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(() => ({ state: null, search: '', pathname: '/goodbye', hash: '' })),
  };
});

const mockUseArchives = useArchives as Mock;
const mockUseRoomName = useRoomName as Mock;
const mockUseLocation = useLocation as Mock;

describe('useGoodByePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRoomName.mockReturnValue('my-room');
    mockUseArchives.mockReturnValue([]);
  });

  it('returns the roomName from useRoomName', () => {
    const { result } = renderHook(() => useGoodByePage());
    expect(result.current.roomName).toBe('my-room');
  });

  it('calls useRoomName with useLocationState: true', () => {
    renderHook(() => useGoodByePage());
    expect(mockUseRoomName).toHaveBeenCalledWith({ useLocationState: true });
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
