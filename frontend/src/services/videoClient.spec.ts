import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithAuthRedirect } from './videoClient';

describe('fetchWithAuthRedirect', () => {
  const fakeLocation = { pathname: '/room/abc123', search: '?foo=bar', href: '' };

  beforeEach(() => {
    vi.spyOn(window, 'location', 'get').mockReturnValue(fakeLocation as unknown as Location);
    fakeLocation.href = '';
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

    expect(fakeLocation.href).toEqual('');
  });

  it('redirects to sign-in with the current path as returnTo on a 401', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 401 }));

    await fetchWithAuthRedirect('https://example.com/v2');

    expect(fakeLocation.href).toContain('/auth/signin?returnTo=');
    expect(fakeLocation.href).toContain(encodeURIComponent('/room/abc123?foo=bar'));
  });
});
