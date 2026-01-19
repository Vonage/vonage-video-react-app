import { vi } from 'vitest';

/**
 * Partial mock factory for @vonage/client-sdk-video module.
 * Keeps original module functionality and only overrides methods that need mocking.
 */
const mockVonageVideoSDK = async () => {
  const actual = await vi.importActual<typeof import('@vonage/client-sdk-video')>(
    '@vonage/client-sdk-video'
  );

  return {
    ...actual,

    initPublisher: vi.fn(() => {
      throw new Error(
        'OT.initPublisher() requires hardware access. Mock this method in your test:\n' +
          'vi.mocked(OT.initPublisher).mockReturnValue(yourMockPublisher);'
      );
    }),

    initSession: vi.fn(() => {
      throw new Error(
        'OT.initSession() requires network access. Mock this method in your test:\n' +
          'vi.mocked(OT.initSession).mockReturnValue(yourMockSession);'
      );
    }),

    hasMediaProcessorSupport: vi.fn(() => {
      throw new Error(
        'OT.hasMediaProcessorSupport() requires browser APIs. Mock this method in your test:\n' +
          'vi.mocked(OT.hasMediaProcessorSupport).mockReturnValue(true);'
      );
    }),

    getDevices: vi.fn(() => {
      throw new Error(
        'OT.getDevices() requires hardware access. Mock this method in your test:\n' +
          'vi.mocked(OT.getDevices).mockResolvedValue([...]);'
      );
    }),

    setAudioOutputDevice: vi.fn(() => {
      throw new Error(
        'OT.setAudioOutputDevice() requires hardware access. Mock this method in your test:\n' +
          'vi.mocked(OT.setAudioOutputDevice).mockResolvedValue(undefined);'
      );
    }),

    getActiveAudioOutputDevice: vi.fn(() => {
      throw new Error(
        'OT.getActiveAudioOutputDevice() requires hardware access. Mock this method in your test:\n' +
          'vi.mocked(OT.getActiveAudioOutputDevice).mockResolvedValue("deviceId");'
      );
    }),

    getAudioOutputDevices: vi.fn(() => {
      throw new Error(
        'OT.getAudioOutputDevices() requires hardware access. Mock this method in your test:\n' +
          'vi.mocked(OT.getAudioOutputDevices).mockResolvedValue([...]);'
      );
    }),
  };
};

export default mockVonageVideoSDK;
