import { describe, it, expect, beforeEach, vi, Mock, afterAll } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SoundTest from './SoundTest';
import useAudioOutputContext from '../../hooks/useAudioOutputContext';
import { AudioOutputContextType, AudioOutputProvider } from '../../Context/AudioOutputProvider';
import { nativeDevices } from '../../utils/mockData/device';

vi.mock('../../hooks/useAudioOutputContext');
const mockUseAudioOutputContext = useAudioOutputContext as Mock<[], AudioOutputContextType>;

describe('SoundTest', () => {
  const nativeMediaDevices = global.navigator.mediaDevices;
  const nativeAudio = global.Audio;
  let audioOutputContext: AudioOutputContextType;
  const playMock = vi.fn();
  const pauseMock = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: vi.fn(
          () =>
            new Promise<MediaDeviceInfo[]>((res) => {
              res(nativeDevices as MediaDeviceInfo[]);
            })
        ),
        addEventListener: vi.fn(() => []),
        removeEventListener: vi.fn(() => []),
      },
    });
    global.Audio = vi.fn().mockImplementation(() => ({
      play: playMock,
      pause: pauseMock,
      currentTime: 9001,
      setSinkId: vi.fn(),
    }));

    audioOutputContext = {
      audioOutput: 'some-device-id',
      setAudioOutput: vi.fn(),
    } as unknown as AudioOutputContextType;
    mockUseAudioOutputContext.mockReturnValue(
      audioOutputContext as unknown as AudioOutputContextType
    );
  });

  afterAll(() => {
    global.Audio = nativeAudio;
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: nativeMediaDevices,
    });
  });

  it('renders', () => {
    render(
      <AudioOutputProvider>
        <SoundTest>
          <SportsFootballIcon />
        </SoundTest>
      </AudioOutputProvider>
    );

    const renderedSoundTest = screen.getByTestId('soundTest');

    expect(renderedSoundTest).toBeInTheDocument();
  });

  it('clicking the SoundTest toggles audio playing', () => {
    render(
      <AudioOutputProvider>
        <SoundTest>
          <SportsFootballIcon />
        </SoundTest>
      </AudioOutputProvider>
    );

    const renderedSoundTest = screen.getByTestId('soundTest');
    act(() => {
      renderedSoundTest.click();
    });

    // First toggle should play the audio
    expect(playMock).toHaveBeenCalledOnce();
    expect(pauseMock).not.toHaveBeenCalled();

    // Reset the mock and click again
    playMock.mockReset();
    act(() => {
      renderedSoundTest.click();
    });

    // Second toggle should pause the audio
    expect(playMock).not.toHaveBeenCalledOnce();
    expect(pauseMock).toHaveBeenCalledOnce();
  });

  it('displays `Test speakers` when audio is not playing', () => {
    render(
      <AudioOutputProvider>
        <SoundTest>
          <SportsFootballIcon />
        </SoundTest>
      </AudioOutputProvider>
    );

    const displayedText = screen.getByText('Test speakers');
    expect(displayedText).toBeInTheDocument();
  });

  it('displays `Stop testing` when audio is playing', () => {
    render(
      <AudioOutputProvider>
        <SoundTest>
          <SportsFootballIcon />
        </SoundTest>
      </AudioOutputProvider>
    );

    const renderedSoundTest = screen.getByTestId('soundTest');
    act(() => {
      renderedSoundTest.click();
    });

    const displayedText = screen.getByText('Stop testing');
    expect(displayedText).toBeInTheDocument();
  });

  it('does not throw if setSinkId is undefined', () => {
    global.Audio = vi.fn().mockImplementation(() => ({
      play: playMock,
      pause: pauseMock,
      currentTime: 9001,
      setSinkId: undefined,
    }));
    render(
      <AudioOutputProvider>
        <SoundTest>
          <SportsFootballIcon />
        </SoundTest>
      </AudioOutputProvider>
    );

    const renderedSoundTest = screen.getByTestId('soundTest');
    act(() => {
      renderedSoundTest.click();
    });

    const displayedText = screen.getByText('Stop testing');
    expect(displayedText).toBeInTheDocument();
  });

  it('stops playing the sound when user clicks away', async () => {
    render(
      <AudioOutputProvider>
        <SoundTest>
          <SportsFootballIcon />
        </SoundTest>
      </AudioOutputProvider>
    );

    const renderedSoundTest = screen.getByTestId('soundTest');
    act(() => {
      renderedSoundTest.click();
    });

    expect(playMock).toHaveBeenCalledOnce();

    await userEvent.click(document.body);
    expect(pauseMock).toHaveBeenCalledOnce();
  });
});
