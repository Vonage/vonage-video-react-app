import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, render as renderBase } from '@testing-library/react';
import { ReactElement } from 'react';
import { makeRoomContextWrapper, type RoomContextWrapperOptions } from '@test/providers';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import ControlPanel from '.';
import composeProviders from '@common/helpers/composeProviders';
import SuspenseBoundary from '@common/components/SuspenseBoundary';

describe('ControlPanel', () => {
  beforeEach(() => {
    const { mediaDevices } = globalThis.navigator;

    vi.spyOn(mediaDevices, 'enumerateDevices').mockResolvedValue([]);
    vi.spyOn(mediaDevices, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevices, 'removeEventListener').mockImplementation(() => {});

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

function render(
  ui: ReactElement,
  options?: {
    roomContextOptions?: RoomContextWrapperOptions;
  }
) {
  const { RoomProviderWrapper } = makeRoomContextWrapper(options?.roomContextOptions);

  const wrapper = composeProviders(
    SuspenseBoundary,
    RoomProviderWrapper,
    backgroundEffectsDialog$.Provider,
    precallNetworkTestDialog$.Provider
  );

  return renderBase(ui, { ...options, wrapper });
}
