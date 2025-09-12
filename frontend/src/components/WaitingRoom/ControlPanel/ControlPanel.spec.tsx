import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { cleanup, screen, render } from '@testing-library/react';
import ControlPanel from '.';
import useDevices from '../../../hooks/useDevices';
import { AllMediaDevices } from '../../../types';
import { allMediaDevices } from '../../../utils/mockData/device';
import useConfigContext from '../../../hooks/useConfigContext';
import { ConfigContextType } from '../../../Context/ConfigProvider';

vi.mock('../../../hooks/useDevices.tsx');
vi.mock('../../../hooks/useConfigContext');
const mockUseDevices = useDevices as Mock<
  [],
  { allMediaDevices: AllMediaDevices; getAllMediaDevices: () => void }
>;
const mockUseConfigContext = useConfigContext as Mock<[], ConfigContextType>;

describe('ControlPanel', () => {
  beforeEach(() => {
    mockUseDevices.mockReturnValue({
      getAllMediaDevices: vi.fn(),
      allMediaDevices,
    });
    mockUseConfigContext.mockReturnValue({
      waitingRoomSettings: {
        allowDeviceSelection: true,
      },
    } as unknown as ConfigContextType);
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

  it('should not be rendered if configured to be hidden', () => {
    mockUseConfigContext.mockReturnValue({
      waitingRoomSettings: {
        allowDeviceSelection: false,
      },
    } as unknown as ConfigContextType);

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

    expect(screen.queryByTestId('ControlPanel')).not.toBeInTheDocument();
  });
});
