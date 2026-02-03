import { render as renderBase, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReactElement } from 'react';
import BackgroundEffectOptions from './BackgroundEffectOptions';
import { makeBackgroundPublisherProviderWrapper } from '@test/providers';
import mediaDevicesMock from '@common/test/mocks/mediaDevicesMock';

describe('BackgroundEffectOptions', () => {
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
    vi.spyOn(mediaDevicesMock, 'getUserMedia').mockResolvedValue({
      getTracks: () => [],
      getAudioTracks: () => [],
      getVideoTracks: () => [],
    } as unknown as MediaStream);
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

  it('renders background options grid with effects and gallery', async () => {
    render(<BackgroundEffectOptions mode="meeting" />);

    await waitFor(() => {
      expect(screen.getByTestId('vivid-icon-remove-line')).toBeInTheDocument();
      expect(screen.getByTestId('vivid-icon-blur-line')).toBeInTheDocument();

      expect(screen.getByAltText('Bookshelf Room')).toBeInTheDocument();
      expect(screen.getByAltText('Busy Room')).toBeInTheDocument();
    });
  });
});

function render(ui: ReactElement) {
  const { BackgroundPublisherProviderWrapper } = makeBackgroundPublisherProviderWrapper();

  return renderBase(ui, {
    wrapper: BackgroundPublisherProviderWrapper,
  });
}
