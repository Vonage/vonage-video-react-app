import { render as renderBase, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeTestProvider, providers } from '@test/providers';
import type { ProviderOptions } from '@test/providers';
import BackgroundEffectsDialog from './BackgroundEffectsDialog';
import { setupWindowNavigatorMock, makeMediaStreamMock } from '@web-test/fixtures';

describe('BackgroundEffectsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve([]),
        getUserMedia: Promise.resolve(makeMediaStreamMock({})),
        getDisplayMedia: Promise.resolve(makeMediaStreamMock({})),
        getSupportedConstraints: vi.fn().mockReturnValue({}),
      },
    });

    const { permissions } = globalThis.navigator;

    vi.spyOn(permissions, 'query').mockResolvedValue({ state: 'granted' } as PermissionStatus);
  });

  it('renders dialog when open', async () => {
    render(
      <BackgroundEffectsDialog isBackgroundEffectsOpen setIsBackgroundEffectsOpen={() => {}} />
    );
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByText(/video effects/i)).toBeInTheDocument();
  });

  it('does not render dialog when closed', async () => {
    const { queryByRole } = render(
      <BackgroundEffectsDialog
        isBackgroundEffectsOpen={false}
        setIsBackgroundEffectsOpen={() => {}}
      />
    );
    await waitFor(() => {
      expect(queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('calls setBackgroundEffectsOpen(false) on close', async () => {
    const setBackgroundEffectsOpen = vi.fn();
    render(
      <BackgroundEffectsDialog
        isBackgroundEffectsOpen
        setIsBackgroundEffectsOpen={setBackgroundEffectsOpen}
      />
    );
    const backdrop = document.querySelector('.MuiBackdrop-root');

    if (!backdrop) {
      throw new Error('Backdrop not found');
    }

    expect(backdrop).toBeTruthy();

    await userEvent.click(backdrop);

    await waitFor(() => {
      expect(setBackgroundEffectsOpen).toHaveBeenCalledWith(false);
    });
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
  publisherContext?: ProviderOptions['PublisherContext'];
  backgroundPublisherContext?: ProviderOptions['BackgroundPublisherContext'];
};

function render(
  ui: ReactElement,
  { userContext, sessionContext, publisherContext, backgroundPublisherContext }: RenderOptions = {}
) {
  const { wrapper, ...context } = makeTestProvider(
    [
      providers.user,
      providers.session,
      providers.publisher,
      providers.backgroundPublisher,
      providers.runtime,
    ],
    {
      userContext,
      sessionContext,
      publisherContext,
      backgroundPublisherContext,
      runtimeContext: undefined,
    }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
