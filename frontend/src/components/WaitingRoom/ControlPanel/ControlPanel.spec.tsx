import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, render as renderBase } from '@testing-library/react';
import { ReactElement } from 'react';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import ControlPanel from '.';
import composeProviders from '@web/helpers/composeProviders';
import SuspenseBoundary from '@web/components/SuspenseBoundary';
import { setupWindowNavigatorMock } from '@web-test/fixtures';

describe('ControlPanel', () => {
  beforeEach(() => {
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        enumerateDevices: Promise.resolve([]),
      },
    });

    Object.defineProperty(global.navigator, 'permissions', {
      writable: true,
      value: {
        query: vi.fn().mockResolvedValue({ state: 'granted' }),
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('should render', () => {
    render(
      <ControlPanel
        handleAudioInputOpen={() => {}}
        handleVideoInputOpen={() => {}}
        handleAudioOutputOpen={() => {}}
        handleClose={() => {}}
        openAudioInput={false}
        openVideoInput={false}
        openAudioOutput={false}
        anchorEl={null}
      />
    );

    expect(screen.getByTestId('ControlPanel')).toBeVisible();
  });

  it('should display open audio input devices menu', () => {
    const { rerender } = render(
      <ControlPanel
        handleAudioInputOpen={() => {}}
        handleVideoInputOpen={() => {}}
        handleAudioOutputOpen={() => {}}
        handleClose={() => {}}
        openAudioInput={false}
        openVideoInput={false}
        openAudioOutput={false}
        anchorEl={null}
      />
    );

    expect(screen.queryByTestId('audioinput-menu')).not.toBeInTheDocument();
    rerender(
      <ControlPanel
        handleAudioInputOpen={() => {}}
        handleVideoInputOpen={() => {}}
        handleAudioOutputOpen={() => {}}
        handleClose={() => {}}
        openAudioInput
        openVideoInput={false}
        openAudioOutput={false}
        anchorEl={null}
      />
    );
    expect(screen.getByTestId('audioinput-menu')).toBeVisible();
  });

  it('should open video input devices menu', () => {
    const { rerender } = render(
      <ControlPanel
        handleAudioInputOpen={() => {}}
        handleVideoInputOpen={() => {}}
        handleAudioOutputOpen={() => {}}
        handleClose={() => {}}
        openAudioInput={false}
        openVideoInput={false}
        openAudioOutput={false}
        anchorEl={null}
      />
    );

    expect(screen.queryByTestId('videoinput-menu')).not.toBeInTheDocument();
    rerender(
      <ControlPanel
        handleAudioInputOpen={() => {}}
        handleVideoInputOpen={() => {}}
        handleAudioOutputOpen={() => {}}
        handleClose={() => {}}
        openAudioInput={false}
        openVideoInput
        openAudioOutput={false}
        anchorEl={null}
      />
    );
    expect(screen.getByTestId('videoinput-menu')).toBeVisible();
  });

  it('should open audio output devices menu', () => {
    const { rerender } = render(
      <ControlPanel
        handleAudioInputOpen={() => {}}
        handleVideoInputOpen={() => {}}
        handleAudioOutputOpen={() => {}}
        handleClose={() => {}}
        openAudioInput={false}
        openVideoInput={false}
        openAudioOutput={false}
        anchorEl={null}
      />
    );

    expect(screen.queryByTestId('audiooutput-menu')).not.toBeInTheDocument();
    rerender(
      <ControlPanel
        handleAudioInputOpen={() => {}}
        handleVideoInputOpen={() => {}}
        handleAudioOutputOpen={() => {}}
        handleClose={() => {}}
        openAudioInput={false}
        openVideoInput={false}
        openAudioOutput
        anchorEl={null}
      />
    );
    expect(screen.getByTestId('audiooutput-menu')).toBeVisible();
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
  publisherContext?: ProviderOptions['PublisherContext'];
  backgroundPublisherContext?: ProviderOptions['BackgroundPublisherContext'];
  previewPublisherContext?: ProviderOptions['PreviewPublisherContext'];
};

function render(
  ui: ReactElement,
  {
    userContext,
    sessionContext,
    publisherContext,
    backgroundPublisherContext,
    previewPublisherContext,
  }: RenderOptions = {}
) {
  const { wrapper: ControlPanelWrapper, ...context } = makeTestProvider(
    [
      providers.user,
      providers.session,
      providers.publisher,
      providers.backgroundPublisher,
      providers.previewPublisher,
      providers.runtime,
    ],
    {
      userContext,
      sessionContext,
      publisherContext,
      backgroundPublisherContext,
      previewPublisherContext,
      runtimeContext: undefined,
    }
  );

  const wrapper = composeProviders(
    SuspenseBoundary,
    ControlPanelWrapper,
    backgroundEffectsDialog$.Provider,
    precallNetworkTestDialog$.Provider
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
