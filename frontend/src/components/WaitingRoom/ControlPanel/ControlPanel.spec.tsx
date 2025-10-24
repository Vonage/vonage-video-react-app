import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { cleanup, screen, render as renderBase, RenderOptions } from '@testing-library/react';
import AppConfigStore from '@Context/ConfigProvider/AppConfigStore';
import { ConfigProviderBase } from '@Context/ConfigProvider/ConfigProvider';
import React from 'react';
import ControlPanel from '.';
import useDevices from '../../../hooks/useDevices';
import { AllMediaDevices } from '../../../types';
import { allMediaDevices } from '../../../utils/mockData/device';

vi.mock('../../../hooks/useDevices.tsx');

const mockUseDevices = useDevices as Mock<
  [],
  { allMediaDevices: AllMediaDevices; getAllMediaDevices: () => void }
>;

describe('ControlPanel', () => {
  beforeEach(() => {
    mockUseDevices.mockReturnValue({
      getAllMediaDevices: vi.fn(),
      allMediaDevices,
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

    expect(screen.queryByTestId('audioInput-menu')).not.toBeInTheDocument();
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
    expect(screen.getByTestId('audioInput-menu')).toBeVisible();
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

    expect(screen.queryByTestId('videoInput-menu')).not.toBeInTheDocument();
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
    expect(screen.getByTestId('videoInput-menu')).toBeVisible();
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

    expect(screen.queryByTestId('audioOutput-menu')).not.toBeInTheDocument();
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
    expect(screen.getByTestId('audioOutput-menu')).toBeVisible();
  });

  it('is not rendered when allowDeviceSelection is false', () => {
    const configStore = new AppConfigStore({
      waitingRoomSettings: {
        allowDeviceSelection: false,
      },
    });

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
      />,
      {
        wrapper: makeProvidersWrapper({ configStore }),
      }
    );

    expect(screen.queryByTestId('ControlPanel')).not.toBeInTheDocument();
  });
});

function render(ui: React.ReactElement, options?: RenderOptions) {
  const Wrapper = options?.wrapper ?? makeProvidersWrapper();
  return renderBase(ui, { ...options, wrapper: Wrapper });
}

function makeProvidersWrapper(providers?: { configStore?: AppConfigStore }) {
  const configStore =
    providers?.configStore ??
    new AppConfigStore({
      waitingRoomSettings: {
        allowDeviceSelection: true,
      },
    });

  const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <ConfigProviderBase value={configStore}>{children}</ConfigProviderBase>
  );

  return Wrapper;
}
