import { describe, expect, it } from 'vitest';
import { render as renderBase, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { makeTestProvider, providers } from '@test/providers';
import type { ScreenShareState } from '@Context/screenShare/constants/initialState';
import ScreenShareError from './ScreenShareError';

describe('ScreenShareError', () => {
  it('renders nothing when there is no screen share error', () => {
    render(<ScreenShareError />);

    expect(screen.queryByText(/Screen share error:/)).toBeNull();
  });

  it('renders the error message when screen sharing fails to publish', () => {
    render(<ScreenShareError />, { shareScreenError: 'Publishing failed' });

    expect(screen.getByText('Screen share error: Publishing failed')).toBeVisible();
  });
});

function render(ui: ReactElement, screenShareState?: Partial<ScreenShareState>) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.runtime, providers.user, providers.session, providers.screenShare],
    {
      runtimeContext: undefined,
      userContext: undefined,
      sessionContext: undefined,
      screenShareContext: screenShareState
        ? { value: (initialValue) => ({ ...initialValue, ...screenShareState }) }
        : undefined,
    }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
