import { ReactElement, StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render as renderBase } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import composeProviders from '@web/helpers/composeProviders';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import TimeRoomName from './TimeRoomName';

const sessionKey =
  'eyJhbGciOiJIUzI1NiJ9.eyJzZXNzaW9uSWQiOiIxX01YNHhNak0wTlRZM09INC1WR2gxSUVabFlpQXlOeUF3T0Rvek1qb3pOQ0JRVTFRZ01qQXlNSDR3TGpJME5EWXhNakUiLCJyb29tTmFtZSI6IlRlc3RDb21wb25lbnRSb29tIn0.fakesig';

describe('TimeRoomName', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render, update the time every second, and clear the interval on unmount', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-29T10:30:00'));

    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

    const { unmount, getByTestId } = render(<TimeRoomName />);

    const element = getByTestId('time-room-name');

    expect(element).toHaveTextContent('10:30 AM | TestComponentRoom');

    vi.setSystemTime(new Date('2026-06-29T10:31:00'));

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(element).toHaveTextContent('10:31 AM | TestComponentRoom');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalledOnce();
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
  runtimeContext?: ProviderOptions['RuntimeContext'];
};

function render(
  ui: ReactElement,
  { userContext, sessionContext, runtimeContext }: RenderOptions = {}
) {
  const { wrapper: ContextWrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.runtime],
    {
      userContext,
      sessionContext: {
        ...sessionContext,
        initialValue: {
          sessionKey,
          ...sessionContext?.initialValue,
        },
      },
      runtimeContext,
    }
  );

  const wrapper = composeProviders(StrictMode, MemoryRouter, ContextWrapper);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
