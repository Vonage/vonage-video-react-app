import { renderHook as renderHookBase, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import useGoodByePage from '../useGoodByePage';
import { useLocation, useParams } from 'react-router-dom';
import { availableArchive } from '../../api/archiving/tests/data';
import { makeTestProvider, providers, type ProviderOptions } from '@core-test/providers';
import { makeVideoClientMock } from '@core-test/fixtures';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(() => ({ state: null, search: '', pathname: '/goodbye', hash: '' })),
    useParams: vi.fn(() => ({ roomIdentifier: 'my-session-key' })),
  };
});

const mockUseParams = useParams as Mock;
const mockUseLocation = useLocation as Mock;

type RenderOptions = {
  runtimeContext?: ProviderOptions['RuntimeContext'];
};

function renderHook<Result>(render: () => Result, { runtimeContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.runtime], {
    runtimeContext,
  });

  return {
    ...context,
    ...renderHookBase(render, { wrapper }),
  };
}

describe('useGoodByePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ roomIdentifier: 'my-session-key' });
  });

  it('returns the sessionKey from URL params', () => {
    const videoClient = makeVideoClientMock({
      searchArchives: Promise.resolve({ items: [], count: 0 }),
    });
    const { result } = renderHook(() => useGoodByePage(), { runtimeContext: { videoClient } });
    expect(result.current.sessionKey).toBe('my-session-key');
  });

  it('fetches archives from videoClient with sessionKey', async () => {
    const videoClient = makeVideoClientMock({
      searchArchives: vi.fn().mockResolvedValue({ items: [], count: 0 }),
    });

    renderHook(() => useGoodByePage(), { runtimeContext: { videoClient } });

    await waitFor(() => {
      expect(videoClient.searchArchives).toHaveBeenCalled();
    });

    expect(videoClient.searchArchives).toHaveBeenCalledWith({
      sessionKey: 'my-session-key',
      count: undefined,
      offset: undefined,
    });
  });

  it('forwards archives from videoClient', async () => {
    const videoClient = makeVideoClientMock({
      searchArchives: Promise.resolve({
        items: [availableArchive],
        count: 1,
      } as unknown as ReturnType<typeof videoClient.searchArchives>),
    });
    const { result } = renderHook(() => useGoodByePage(), { runtimeContext: { videoClient } });

    await waitFor(() => {
      expect(result.current.archives).not.toBe('error');
    });

    expect(result.current.archives).toEqual([availableArchive]);
  });

  it('forwards "error" from videoClient when archives fail to load', async () => {
    const videoClient = makeVideoClientMock({
      searchArchives: vi.fn().mockRejectedValue(new Error('Failed')),
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 0 } } });
    const { result } = renderHook(() => useGoodByePage(), {
      runtimeContext: { videoClient, queryClient },
    });

    await waitFor(() => {
      expect(result.current.archives).toBe('Failed');
    });
  });

  it('uses location.state header when provided', () => {
    mockUseLocation.mockReturnValue({
      state: { header: 'Custom Header', caption: 'Custom Caption' },
    });

    const videoClient = makeVideoClientMock({
      searchArchives: Promise.resolve({ items: [], count: 0 }),
    });
    const { result } = renderHook(() => useGoodByePage(), { runtimeContext: { videoClient } });
    expect(result.current.header).toBe('Custom Header');
    expect(result.current.caption).toBe('Custom Caption');
  });

  it('falls back to default i18n header when location.state is null', () => {
    mockUseLocation.mockReturnValue({ state: null });

    const videoClient = makeVideoClientMock({
      searchArchives: Promise.resolve({ items: [], count: 0 }),
    });
    const { result } = renderHook(() => useGoodByePage(), { runtimeContext: { videoClient } });
    expect(typeof result.current.header).toBe('string');
    expect(result.current.header.length).toBeGreaterThan(0);
  });

  it('falls back to default i18n caption when location.state has no caption', () => {
    mockUseLocation.mockReturnValue({ state: { header: 'Some Header' } });

    const videoClient = makeVideoClientMock({
      searchArchives: Promise.resolve({ items: [], count: 0 }),
    });
    const { result } = renderHook(() => useGoodByePage(), { runtimeContext: { videoClient } });
    expect(typeof result.current.caption).toBe('string');
    expect(result.current.caption.length).toBeGreaterThan(0);
  });
});
