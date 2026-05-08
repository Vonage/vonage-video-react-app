import { renderHook } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import useRoomShareUrl from '../useRoomShareUrl';
import { makeTestProvider, providers } from '@test/providers';

// A valid fake JWT containing sessionId: '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE'
const mockSessionKey =
  'eyJhbGciOiJIUzI1NiJ9.eyJzZXNzaW9uSWQiOiIxX01YNHhNak0wTlRZM09INC1WR2gxSUVabFlpQXlOeUF3T0Rvek1qb3pOQ0JRVTFRZ01qQXlNSDR3TGpJME5EWXhNakUiLCJyb29tTmFtZSI6IlRlc3RDb21wb25lbnRSb29tIn0.fakesig';

describe('useRoomShareUrl', () => {
  beforeAll(() => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      origin: 'https://example.com',
    } as unknown as Location);
  });

  it('should return link to waiting room', () => {
    const { wrapper } = makeTestProvider([providers.user, providers.session, providers.runtime], {
      sessionContext: {
        initialValue: { sessionKey: mockSessionKey },
      },
      userContext: undefined,
      runtimeContext: undefined,
    });

    const { result } = renderHook(() => useRoomShareUrl(), { wrapper });
    expect(result.current).toBe(`https://example.com/waiting-room/${mockSessionKey}`);
  });
});
