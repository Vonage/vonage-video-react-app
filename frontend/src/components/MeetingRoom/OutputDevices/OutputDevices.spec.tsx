import { describe, it, beforeEach, afterEach, vi, expect, Mock } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import OutputDevices from './OutputDevices';
import useDevices from '../../../hooks/useDevices';
import useAudioOutputContext from '../../../hooks/useAudioOutputContext';
import useConfigContext from '../../../hooks/useConfigContext';
import { AllMediaDevices } from '../../../types';
import { AudioOutputContextType } from '../../../Context/AudioOutputProvider';
import { ConfigContextType } from '../../../Context/ConfigProvider';
import { allMediaDevices } from '../../../utils/mockData/device';
import * as util from '../../../utils/util';

// Mocks
vi.mock('../../../hooks/useDevices');
vi.mock('../../../hooks/useAudioOutputContext');
vi.mock('../../../hooks/useConfigContext');
vi.mock('../../../utils/util', () => ({
  isGetActiveAudioOutputDeviceSupported: vi.fn(),
}));

const mockUseDevices = useDevices as Mock<
  [],
  { allMediaDevices: AllMediaDevices; getAllMediaDevices: () => void }
>;
const mockUseAudioOutputContext = useAudioOutputContext as Mock<[], AudioOutputContextType>;
const mockUseConfigContext = useConfigContext as Mock<[], ConfigContextType>;

describe('OutputDevices Component', () => {
  const mockHandleToggle = vi.fn();
  const mockSetAudioOutputDevice = vi.fn();
  let audioOutputContext: AudioOutputContextType;
  let mockConfigContext: ConfigContextType;

  beforeEach(() => {
    mockUseDevices.mockReturnValue({
      getAllMediaDevices: vi.fn(),
      allMediaDevices,
    });

    audioOutputContext = {
      currentAudioOutputDevice: 'default',
      setAudioOutputDevice: mockSetAudioOutputDevice,
    } as AudioOutputContextType;

    mockConfigContext = {
      meetingRoomSettings: {
        allowDeviceSelection: true,
      },
    } as unknown as ConfigContextType;

    mockUseAudioOutputContext.mockImplementation(() => audioOutputContext);
    mockUseConfigContext.mockReturnValue(mockConfigContext);
    (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('renders all available audio output devices when supported', () => {
    render(<OutputDevices handleToggle={mockHandleToggle} customLightBlueColor="#00f" />);

    expect(screen.getByText('Speakers')).toBeInTheDocument();
    expect(screen.getByTestId('output-devices')).toBeInTheDocument();

    // Check that specific audio output devices are rendered
    expect(screen.getByText('System Default')).toBeInTheDocument();
    expect(screen.getByText('Soundcore Life A2 NC (Bluetooth)')).toBeInTheDocument();
    expect(screen.getByText('MacBook Pro Speakers (Built-in)')).toBeInTheDocument();
  });

  it('renders only default device when audio output is not supported', () => {
    (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(false);

    render(<OutputDevices handleToggle={mockHandleToggle} customLightBlueColor="#00f" />);

    expect(screen.getByText('Speakers')).toBeInTheDocument();
    expect(screen.getByText('System Default')).toBeInTheDocument();

    // Should not render the actual audio output devices
    expect(screen.queryByText('Soundcore Life A2 NC (Bluetooth)')).not.toBeInTheDocument();
  });

  it('changes audio output device on menu item click when supported', async () => {
    render(<OutputDevices handleToggle={mockHandleToggle} customLightBlueColor="#00f" />);

    const speakerItem = screen.getByText('Soundcore Life A2 NC (Bluetooth)');
    fireEvent.click(speakerItem);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    expect(mockSetAudioOutputDevice).toHaveBeenCalledWith(
      '9a2f0c5c9cf94d8bc34847f13ce863864d18ab9f969a73ffa9d15c8162829d68'
    );
  });

  it('does not call setAudioOutputDevice when audio output is not supported', () => {
    (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(false);

    render(<OutputDevices handleToggle={mockHandleToggle} customLightBlueColor="#00f" />);

    const defaultItem = screen.getByText('System Default');
    fireEvent.click(defaultItem);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    expect(mockSetAudioOutputDevice).not.toHaveBeenCalled();
  });

  it('shows check icon for selected device', () => {
    render(<OutputDevices handleToggle={mockHandleToggle} customLightBlueColor="#00f" />);

    // The device with deviceId 'default' should be selected
    const checkIcon = screen.getByTestId('CheckIcon');
    expect(checkIcon).toBeInTheDocument();
  });

  it('shows check icon for default device when only one device available', () => {
    (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(false);

    render(<OutputDevices handleToggle={mockHandleToggle} customLightBlueColor="#00f" />);

    // When only default device is available, it should be selected
    const checkIcon = screen.getByTestId('CheckIcon');
    expect(checkIcon).toBeInTheDocument();
  });

  it('is not rendered when allowDeviceSelection is false', () => {
    mockConfigContext.meetingRoomSettings.allowDeviceSelection = false;
    mockUseConfigContext.mockReturnValue(mockConfigContext);

    render(<OutputDevices handleToggle={mockHandleToggle} customLightBlueColor="#00f" />);

    expect(screen.queryByTestId('output-device-title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('output-devices')).not.toBeInTheDocument();
  });
});
