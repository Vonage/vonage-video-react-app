import { render as renderBase, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import makeBackgroundPublisherProviderWrapper, {
  type BackgroundPublisherProviderWrapperOptions,
} from '@test/providers/makeBackgroundPublisherProviderWrapper';
import mediaDevicesMock from '@common/test/mocks/mediaDevicesMock';
import BackgroundEffectsDialog from './BackgroundEffectsDialog';

describe('BackgroundEffectsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      writable: true,
      configurable: true,
      value: mediaDevicesMock,
    });

    vi.spyOn(mediaDevicesMock, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevicesMock, 'removeEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevicesMock, 'enumerateDevices').mockResolvedValue([]);
    vi.spyOn(mediaDevicesMock, 'getUserMedia').mockResolvedValue({} as unknown as MediaStream);
    vi.spyOn(mediaDevicesMock, 'getDisplayMedia').mockResolvedValue({} as unknown as MediaStream);
    vi.spyOn(mediaDevicesMock, 'getSupportedConstraints').mockReturnValue({});

    Object.defineProperty(globalThis.navigator, 'permissions', {
      writable: true,
      configurable: true,
      value: {
        query: vi.fn().mockResolvedValue({ state: 'granted' }),
      },
    });
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
  const { BackgroundPublisherProviderWrapper, ...props } = makeBackgroundPublisherProviderWrapper({
    ...options,
  });

  return {
    ...props,
    ...renderBase(ui, { wrapper: BackgroundPublisherProviderWrapper }),
  };
}
