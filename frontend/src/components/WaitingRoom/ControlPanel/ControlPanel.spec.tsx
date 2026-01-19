import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { cleanup, screen, render as renderBase } from '@testing-library/react';
import { ReactElement } from 'react';
import useDevices from '@hooks/useDevices';
import { AllMediaDevices } from '@app-types/room';
import { allMediaDevices } from '@utils/mockData/device';
import { makeRoomContextWrapper, type RoomContextWrapperOptions } from '@test/providers';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import ControlPanel from '.';
import composeProviders from '@common/helpers/composeProviders';
import mediaDevicesMock from '@common/test/mocks/mediaDevicesMock';

vi.mock('@hooks/useDevices.tsx');

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

    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: mediaDevicesMock,
    });

    vi.spyOn(mediaDevicesMock, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevicesMock, 'removeEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevicesMock, 'enumerateDevices').mockResolvedValue([]);

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
});

function render(
  ui: ReactElement,
  options?: {
    roomContextOptions?: RoomContextWrapperOptions;
  }
) {
  const { RoomProviderWrapper } = makeRoomContextWrapper(options?.roomContextOptions);

  const wrapper = composeProviders(
    RoomProviderWrapper,
    backgroundEffectsDialog$.Provider,
    precallNetworkTestDialog$.Provider
  );

  return renderBase(ui, { ...options, wrapper });
}
