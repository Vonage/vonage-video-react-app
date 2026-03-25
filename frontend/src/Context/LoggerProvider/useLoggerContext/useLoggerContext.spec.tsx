import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook as renderHookBase, act, waitFor } from '@testing-library/react';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import frontendLogger from '../../../logger';
import useLoggerContext from './useLoggerContext';

vi.mock('../../../logger', () => ({
  default: {
    setContext: vi.fn(),
    clearContext: vi.fn(),
  },
}));

const mockSetContext = vi.mocked(frontendLogger.setContext);
const mockClearContext = vi.mocked(frontendLogger.clearContext);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockVonageVideoClient = { sessionId: 'session-1', connectionId: 'connection-1' } as any;

describe('useLoggerContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls setContext with userId, sessionId and connectionId on mount', () => {
    render({
      userContext: { value: { defaultSettings: { name: 'user-1' } } },
      sessionContext: {
        __interceptor: (ctx) => {
          if (ctx) ctx.vonageVideoClient = mockVonageVideoClient;
        },
      },
    });

    expect(mockSetContext).toHaveBeenCalledWith({
      userId: 'user-1',
      sessionId: 'session-1',
      connectionId: 'connection-1',
    });
  });

  it('calls setContext with undefined sessionId and connectionId when no vonageVideoClient', () => {
    render({ userContext: { value: { defaultSettings: { name: 'user-1' } } } });

    expect(mockSetContext).toHaveBeenCalledWith({
      userId: 'user-1',
      sessionId: undefined,
      connectionId: undefined,
    });
  });

  it('sets userId to undefined when user name is empty', () => {
    render({ userContext: { value: { defaultSettings: { name: '' } } } });

    expect(mockSetContext).toHaveBeenCalledWith(expect.objectContaining({ userId: undefined }));
  });

  it('calls clearContext on unmount', () => {
    const { unmount } = render();

    unmount();

    expect(mockClearContext).toHaveBeenCalledTimes(1);
  });

  it('returns derived userId, sessionId and connectionId', () => {
    const { result } = render({
      userContext: { value: { defaultSettings: { name: 'user-1' } } },
      sessionContext: {
        __interceptor: (ctx) => {
          if (ctx) ctx.vonageVideoClient = mockVonageVideoClient;
        },
      },
    });

    expect(result.current).toEqual({
      userId: 'user-1',
      sessionId: 'session-1',
      connectionId: 'connection-1',
    });
  });

  it('re-calls setContext when userId changes', async () => {
    const { userContext } = render({
      userContext: { value: { defaultSettings: { name: 'user-1' } } },
    });

    act(() => {
      userContext.current?.setUser((prev) => ({
        ...prev,
        defaultSettings: { ...prev.defaultSettings, name: 'new-name' },
      }));
    });

    await waitFor(() => {
      expect(mockSetContext).toHaveBeenLastCalledWith(
        expect.objectContaining({ userId: 'new-name' })
      );
    });
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function render({ userContext, sessionContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.user, providers.session], {
    userContext,
    sessionContext,
  });

  return {
    ...context,
    ...renderHookBase(() => useLoggerContext(), { wrapper }),
  };
}
