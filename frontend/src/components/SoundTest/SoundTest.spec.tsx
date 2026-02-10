import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VividIcon from '@components/VividIcon';
import SoundTest from './SoundTest';
import { nativeDevices } from '../../utils/mockData/device';
import mediaDevicesMock from '@common/test/mocks/mediaDevicesMock';
import { AudioOutputProviderWrapperOptions, makeAudioOutputProviderWrapper } from '@test/providers';
import { ReactElement } from 'react';

describe('SoundTest', () => {
  const playMock = vi.fn();
  const pauseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    if (!globalThis.navigator.mediaDevices) {
      Object.defineProperty(globalThis.navigator, 'mediaDevices', {
        writable: true,
        configurable: true,
        value: mediaDevicesMock,
      });
    }

    vi.spyOn(globalThis.navigator.mediaDevices, 'enumerateDevices').mockResolvedValue(
      nativeDevices as MediaDeviceInfo[]
    );
    vi.spyOn(globalThis.navigator.mediaDevices, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(globalThis.navigator.mediaDevices, 'removeEventListener').mockImplementation(() => {});

    global.Audio = vi.fn().mockImplementation(() => ({
      play: playMock,
      pause: pauseMock,
      currentTime: 9001,
      setSinkId: vi.fn(),
    }));
  });

  it('renders', () => {
    render(
      <SoundTest>
        <VividIcon name="hearing-line" customSize={-5} />
      </SoundTest>
    );

    const renderedSoundTest = screen.getByTestId('soundTest');

    expect(renderedSoundTest).toBeInTheDocument();
  });

  it('clicking the SoundTest toggles audio playing', () => {
    render(
      <SoundTest>
        <VividIcon name="hearing-line" customSize={-5} />
      </SoundTest>
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
      <SoundTest>
        <VividIcon name="hearing-line" customSize={-5} />
      </SoundTest>
    );

    const displayedText = screen.getByText('Test speakers');
    expect(displayedText).toBeInTheDocument();
  });

  it('displays `Stop testing` when audio is playing', () => {
    render(
      <SoundTest>
        <VividIcon name="hearing-line" customSize={-5} />
      </SoundTest>
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
      <SoundTest>
        <VividIcon name="hearing-line" customSize={-5} />
      </SoundTest>
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
      <SoundTest>
        <VividIcon name="hearing-line" customSize={-5} />
      </SoundTest>
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

function render(
  ui: ReactElement,
  options?: {
    audioOutputOptions?: AudioOutputProviderWrapperOptions['audioOutputOptions'];
  }
) {
  const { AudioOutputProviderWrapper, audioOutputContext } = makeAudioOutputProviderWrapper({
    audioOutputOptions: options?.audioOutputOptions,
  });

  return { ...renderBase(ui, { wrapper: AudioOutputProviderWrapper }), audioOutputContext };
}
