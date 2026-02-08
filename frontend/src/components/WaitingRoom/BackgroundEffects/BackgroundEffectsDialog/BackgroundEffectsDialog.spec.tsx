import { render as renderBase, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeTestProvider, providers } from '@test/providers';
import type { BackgroundPublisherProviderWrapperOptions } from '@test/providers';
import BackgroundEffectsDialog from './BackgroundEffectsDialog';

describe('BackgroundEffectsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const { mediaDevices } = globalThis.navigator;

    vi.spyOn(mediaDevices, 'enumerateDevices').mockResolvedValue([]);
    vi.spyOn(mediaDevices, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevices, 'removeEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevices, 'getUserMedia').mockResolvedValue({} as unknown as MediaStream);
    vi.spyOn(mediaDevices, 'getDisplayMedia').mockResolvedValue({} as unknown as MediaStream);
    vi.spyOn(mediaDevices, 'getSupportedConstraints').mockReturnValue({});

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

function render(ui: ReactElement, options: BackgroundPublisherProviderWrapperOptions = {}) {
  const { wrapper, ...props } = makeTestProvider(
    [
      providers.AppConfig,
      providers.User,
      providers.Session,
      providers.Publisher,
      providers.BackgroundPublisher,
    ],
    {
      ...options,
    }
  );

  return {
    ...props,
    ...renderBase(ui, { wrapper }),
  };
}
