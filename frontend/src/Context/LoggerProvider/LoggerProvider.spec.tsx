import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render as renderBase, act, waitFor } from '@testing-library/react';
import frontendLogger from '../../logger';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';

vi.mock('../../logger', () => ({
  default: {
    setContext: vi.fn(),
    clearContext: vi.fn(),
  },
}));

const mockSetContext = vi.mocked(frontendLogger.setContext);
const mockClearContext = vi.mocked(frontendLogger.clearContext);

describe('LoggerProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls setContext with userId from user context on mount', () => {
    render();

    expect(mockSetContext).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1' }));
  });

  it('calls setContext with undefined sessionId and connectionId when no session is connected', () => {
    render();

    expect(mockSetContext).toHaveBeenCalledWith({
      userId: 'user-1',
      sessionId: undefined,
      connectionId: undefined,
    });
  });

  it('never calls clearContext so async events always keep their context', () => {
    const { unmount } = render();

    unmount();

    expect(mockClearContext).not.toHaveBeenCalled();
  });

  it('re-calls setContext when userId changes', async () => {
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

  it('sets userId to undefined when user name is empty', () => {
    render({ userContext: { value: { defaultSettings: { name: '' } } } });

    expect(mockSetContext).toHaveBeenCalledWith(expect.objectContaining({ userId: undefined }));
  });

  it('provides context values to children via LoggerContext', () => {
    const { loggerContext } = render();

    expect(loggerContext.current).toEqual({
      userId: 'user-1',
      sessionId: undefined,
      connectionId: undefined,
    });
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
  loggerContext?: ProviderOptions['LoggerContext'];
};

function render({ userContext, sessionContext, loggerContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.logger] as const,
    {
      userContext: {
        value: { defaultSettings: { name: 'user-1' } },
        ...userContext,
      },
      sessionContext,
      loggerContext,
    }
  );

  const rendered = renderBase(<div />, { wrapper });

  return {
    ...rendered,
    ...context,
  };
}
