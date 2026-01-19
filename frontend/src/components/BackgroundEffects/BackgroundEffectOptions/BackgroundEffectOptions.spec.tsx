import { render as renderBase, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReactElement } from 'react';
import BackgroundEffectOptions from './BackgroundEffectOptions';
import { makeBackgroundPublisherProviderWrapper } from '@test/providers';

describe('BackgroundEffectOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const { mediaDevices } = globalThis.navigator;

    vi.spyOn(mediaDevices, 'enumerateDevices').mockResolvedValue([]);
    vi.spyOn(mediaDevices, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevices, 'removeEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevices, 'getUserMedia').mockResolvedValue({
      getTracks: () => [],
      getAudioTracks: () => [],
      getVideoTracks: () => [],
    } as unknown as MediaStream);
    vi.spyOn(mediaDevices, 'getDisplayMedia').mockResolvedValue({} as unknown as MediaStream);
    vi.spyOn(mediaDevices, 'getSupportedConstraints').mockReturnValue({});

    const { permissions } = globalThis.navigator;

    vi.spyOn(permissions, 'query').mockResolvedValue({ state: 'granted' } as PermissionStatus);
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
