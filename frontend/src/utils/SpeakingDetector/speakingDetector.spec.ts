import { beforeEach, describe, expect, it, vi } from 'vitest';
import SpeakingDetector from './speakingDetector';
import { waitForEvent } from '../async';
import { setupWindowNavigatorMock } from '@web-test/fixtures';
import { mediaDevices$ } from '@core/stores';

const mockCreateMediaStreamSource = vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn() }));

const mockAnalyser = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  getByteTimeDomainData: vi.fn(),
  fftSize: 2048,
};

const mockAudioContext = vi.fn(() => ({
  createMediaStreamSource: mockCreateMediaStreamSource,
  createAnalyser: vi.fn(() => mockAnalyser),
  close: vi.fn(),
})) as unknown as typeof global.AudioContext;

const mockMediaStream = {
  getVideoTracks: vi.fn(() => []),
  getAudioTracks: vi.fn(() => []),
  getTracks: vi.fn(() => [
    {
      stop: vi.fn(),
    } as unknown as MediaStreamTrack,
  ]),
} as unknown as MediaStream;

beforeEach(() => {
  global.AudioContext = mockAudioContext;

  setupWindowNavigatorMock({
    mediaDevices: {
      getUserMedia: Promise.resolve(mockMediaStream),
      enumerateDevices: Promise.resolve([
        {
          deviceId: '132322',
          kind: 'audioinput',
          label: 'Mock Microphone',
          groupId: 'group1',
        } as MediaDeviceInfo,
      ]),
      addEventListener: vi.fn(),
    },
  });

  mediaDevices$.reset();
});

describe('SpeakingDetector', () => {
  let now = Date.now();
  const dateNowSpy = vi.spyOn(global.Date, 'now').mockReturnValue(now);
  const advanceDateNow = (ms: number) => {
    now += ms;
    dateNowSpy.mockReturnValue(now);
  };

  it('should detect speaking while muted and turn off the notification 3 seconds later', async () => {
    const speakingDetector = new SpeakingDetector({ selectedMicrophoneId: '132322' });
    void speakingDetector.turnSpeakingDetectorOn();
    const isSpeakingDetectorSpy = vi.fn();
    const isSpeakingDetectorOffSpy = vi.fn();
    const waitForIsSpeakingWhileMuted = waitForEvent(
      speakingDetector,
      'isSpeakingWhileMuted',
      isSpeakingDetectorSpy
    );
    const waitForIsSpeakingWhileMutedOff = waitForEvent(
      speakingDetector,
      'isSpeakingWhileMutedOff',
      isSpeakingDetectorOffSpy
    );

    await waitForIsSpeakingWhileMuted;
    expect(isSpeakingDetectorSpy).toHaveBeenCalled();
    // Advance time and wait for speaking off detection
    advanceDateNow(3000);
    await waitForIsSpeakingWhileMutedOff;
    expect(isSpeakingDetectorOffSpy).toHaveBeenCalled();
  });

  it('should clean up resources and emit isSpeakingWhileMutedOff when turning detector off', async () => {
    const speakingDetector = new SpeakingDetector({ selectedMicrophoneId: '132322' });

    // Start detector to initialize audioContext, stream, source, analyser and the timer
    await speakingDetector.turnSpeakingDetectorOn();

    // Sanity check that things are initialized
    expect(speakingDetector.audioContext).not.toBeNull();
    expect(speakingDetector.stream).not.toBeNull();
    expect(speakingDetector.source).not.toBeNull();
    expect(speakingDetector.analyser).not.toBeNull();
    expect(speakingDetector.detectSpeakingTimer).toBeDefined();

    // Spy on disconnect and close to ensure they are called
    const analyserDisconnectSpy = vi.spyOn(speakingDetector.analyser!, 'disconnect');
    const sourceDisconnectSpy = vi.spyOn(speakingDetector.source!, 'disconnect');
    const audioContextCloseSpy = vi.spyOn(speakingDetector.audioContext!, 'close');

    // Make it look like the user was speaking while muted (so we exercise turnMuteIndicationOff)
    speakingDetector.isSpeakingWhileMuted = true;

    const speakingWhileMutedOffSpy = vi.fn();
    speakingDetector.on('isSpeakingWhileMutedOff', speakingWhileMutedOffSpy);

    // Act
    speakingDetector.turnSpeakingDetectorOff();

    // disconnect and close should be called
    expect(analyserDisconnectSpy).toHaveBeenCalledTimes(1);
    expect(sourceDisconnectSpy).toHaveBeenCalledTimes(1);
    expect(audioContextCloseSpy).toHaveBeenCalledTimes(1);

    // Internal references should be cleared
    expect(speakingDetector.analyser).toBeNull();
    expect(speakingDetector.source).toBeNull();
    expect(speakingDetector.stream).toBeNull();
    expect(speakingDetector.audioContext).toBeNull();

    // Timers should be cleared
    expect(speakingDetector.detectSpeakingTimer).toBeUndefined();
    expect(speakingDetector.turnMuteIndicationOffTimer).toBeUndefined();

    // Speaking flag should be reset and OFF event emitted
    expect(speakingDetector.isSpeakingWhileMuted).toBe(false);
    expect(speakingWhileMutedOffSpy).toHaveBeenCalled();
  });
});
