import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render as renderBase, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import EffectOptionButtons from './EffectOptionButtons';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import { setupWindowNavigatorMock, makeMediaStreamMock } from '@web-test/fixtures';

describe('EffectOptionButtons', () => {
  const mockHandleBackgroundChange = vi.fn();

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
      },
    });

    const { permissions } = globalThis.navigator;

    vi.spyOn(permissions, 'query').mockResolvedValue({ state: 'granted' } as PermissionStatus);
  });

  it('renders all effect options', async () => {
    render(<EffectOptionButtons />);
    await waitFor(() => {
      expect(screen.getByTestId('vivid-icon-remove-line')).toBeInTheDocument();
      expect(screen.getByTestId('vivid-icon-blur-line')).toBeInTheDocument();
      expect(screen.getByTestId('vivid-icon-blur-solid')).toBeInTheDocument();
    });
  });

  it('marks the selected option as selected', async () => {
    render(<EffectOptionButtons />, {
      backgroundPublisherContext: {
        __onCreated: (context) => {
          context.backgroundSelected = 'low-blur';
        },
      },
    });
    await waitFor(() => {
      const selectedOption = screen.getByTestId('background-low-blur');
      expect(selectedOption).toBeInTheDocument();
    });
  });

  it('sets the selected background', async () => {
    render(<EffectOptionButtons />, {
      backgroundPublisherContext: {
        __interceptor: (context) => {
          context.handleBackgroundChange = mockHandleBackgroundChange;
        },
      },
    });
    await waitFor(() => {
      expect(screen.getByTestId('background-low-blur')).toBeInTheDocument();
    });
    const lowBlur = screen.getByTestId('background-low-blur');
    await userEvent.click(lowBlur);
    await waitFor(() => {
      expect(mockHandleBackgroundChange).toHaveBeenCalledWith('low-blur');
    });
  });

  it('sets the selected background with high blur-sm', async () => {
    render(<EffectOptionButtons />, {
      backgroundPublisherContext: {
        __interceptor: (context) => {
          context.handleBackgroundChange = mockHandleBackgroundChange;
        },
      },
    });
    await waitFor(() => {
      expect(screen.getByTestId('background-high-blur')).toBeInTheDocument();
    });
    const highBlur = screen.getByTestId('background-high-blur');
    await userEvent.click(highBlur);
    await waitFor(() => {
      expect(mockHandleBackgroundChange).toHaveBeenCalledWith('high-blur');
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
