import { describe, it, expect, vi } from 'vitest';
import { render as renderBase, act, waitFor } from '@testing-library/react';
import frontendLogger from '../../logger';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import LoggerSynchronizer from './LoggerSynchronizer';

vi.mock('../../logger', () => ({
  default: {
    setContext: vi.fn(),
    clearContext: vi.fn(),
  },
}));

const mockSetContext = vi.mocked(frontendLogger.setContext);
const mockClearContext = vi.mocked(frontendLogger.clearContext);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockVonageVideoClient = { sessionId: 'session-1', connectionId: 'connection-1' } as any;

describe('LoggerSynchronizer', () => {
  it('syncs userId, sessionId, and connectionId into the logger on mount', () => {
    render({
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

  it('syncs undefined sessionId and connectionId when no session is connected', () => {
    render();

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

  it('re-syncs when userId changes', async () => {
    const { userContext } = render();

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

  it('never calls clearContext so async events always keep their context', () => {
    const { unmount } = render();

    unmount();

    expect(mockClearContext).not.toHaveBeenCalled();
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function render({ userContext, sessionContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.runtime] as const,
    {
      userContext: {
        value: { defaultSettings: { name: 'user-1' } },
        ...userContext,
      },
      sessionContext,
      runtimeContext: undefined,
    }
  );

  const rendered = renderBase(<LoggerSynchronizer />, { wrapper });

  return { ...rendered, ...context };
}
