import { render as renderBase, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReactElement } from 'react';
import BackgroundEffectOptions from './BackgroundEffectOptions';
import { makeTestProvider, providers } from '@test/providers';
import { setupWindowNavigatorMock, makeMediaStreamMock } from '@web-test/fixtures';

describe('BackgroundEffectOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve([]),
        getUserMedia: Promise.resolve(
          makeMediaStreamMock({
            getVideoTracks: [],
            getAudioTracks: [],
          })
        ),
        getDisplayMedia: Promise.resolve(makeMediaStreamMock({})),
        getSupportedConstraints: vi.fn().mockReturnValue({}),
      },
    });

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
  const { wrapper, ...context } = makeTestProvider([
    providers.user,
    providers.session,
    providers.publisher,
    providers.backgroundPublisher,
  ]);

  return {
    ...context,
    ...renderBase(ui, {
      wrapper,
    }),
  };
}
