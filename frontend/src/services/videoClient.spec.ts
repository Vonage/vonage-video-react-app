import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithAuthRedirect } from './videoClient';

describe('fetchWithAuthRedirect', () => {
  const fakeLocation = { pathname: '/room/abc123', search: '?foo=bar', assign: vi.fn() };

  beforeEach(() => {
    vi.spyOn(window, 'location', 'get').mockReturnValue(fakeLocation as unknown as Location);
    fakeLocation.assign.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the request with credentials included', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));

    await fetchWithAuthRedirect('https://example.com/v2', { method: 'POST' });

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/v2', {
      method: 'POST',
      credentials: 'include',
    });
  });

  it('does not redirect on a non-401 response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));

    await fetchWithAuthRedirect('https://example.com/v2');

    expect(fakeLocation.assign).not.toHaveBeenCalled();
  });

  it('navigates to sign-in once with the current path as returnTo and never settles on a 401', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(new Response(null, { status: 401 }))
    );

    const settled = vi.fn();
    void fetchWithAuthRedirect('https://example.com/v2').then(settled, settled);
    void fetchWithAuthRedirect('https://example.com/v2').then(settled, settled);

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(fakeLocation.assign).toHaveBeenCalledTimes(1);
    expect(fakeLocation.assign.mock.calls[0][0]).toContain(
      `/auth/signin?returnTo=${encodeURIComponent('/room/abc123?foo=bar')}`
    );
    expect(settled).not.toHaveBeenCalled();
  });
});
