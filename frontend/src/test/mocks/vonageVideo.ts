import { vi } from 'vitest';
import EventEmitter from 'node:events';
import type { Publisher, Session, Subscriber, Device, VideoFilter } from '@vonage/client-sdk-video';

/**
 * Mock implementation of the Vonage Video SDK.
 * Provides realistic mocks for testing without external dependencies.
 */

/**
 * Creates a mock Publisher instance with common methods.
 */
export function createMockPublisher(overrides: Partial<Publisher> = {}): Publisher {
  const emitter = new EventEmitter();

  return Object.assign(emitter, {
    getAudioSource: vi.fn().mockReturnValue({
      deviceId: 'default-audio',
      label: 'Default Audio Input',
      kind: 'audioInput',
    }),
    getVideoSource: vi.fn().mockReturnValue({
      deviceId: 'default-video',
      label: 'Default Video Input',
      kind: 'videoInput',
    }),
    publishAudio: vi.fn(),
    publishVideo: vi.fn(),
    setAudioSource: vi.fn().mockResolvedValue(undefined),
    setVideoSource: vi.fn().mockResolvedValue(undefined),
    applyVideoFilter: vi.fn().mockResolvedValue(undefined),
    clearVideoFilter: vi.fn(),
    cycleVideo: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn(),
    getStats: vi.fn().mockResolvedValue({}),
    setStyle: vi.fn(),
    videoWidth: vi.fn().mockReturnValue(640),
    videoHeight: vi.fn().mockReturnValue(480),
    ...overrides,
  }) as unknown as Publisher;
}

/**
 * Creates a mock Session instance with common methods.
 */
export function createMockSession(overrides: Partial<Session> = {}): Session {
  const emitter = new EventEmitter();

  return Object.assign(emitter, {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn(),
    publish: vi.fn().mockResolvedValue(undefined),
    unpublish: vi.fn(),
    subscribe: vi.fn().mockReturnValue(createMockSubscriber()),
    unsubscribe: vi.fn(),
    signal: vi.fn().mockResolvedValue(undefined),
    forceDisconnect: vi.fn(),
    forceUnpublish: vi.fn(),
    getPublisherForStream: vi.fn(),
    getSubscribersForStream: vi.fn().mockReturnValue([]),
    capabilities: {
      canForceMute: true,
      canPublish: true,
      canSubscribe: true,
    },
    connection: null,
    sessionId: 'mock-session-id',
    ...overrides,
  }) as unknown as Session;
}

/**
 * Creates a mock Subscriber instance with common methods.
 */
export function createMockSubscriber(overrides: Partial<Subscriber> = {}): Subscriber {
  const emitter = new EventEmitter();

  return Object.assign(emitter, {
    subscribeToAudio: vi.fn(),
    subscribeToVideo: vi.fn(),
    setAudioVolume: vi.fn(),
    getAudioVolume: vi.fn().mockReturnValue(100),
    setPreferredFrameRate: vi.fn(),
    setPreferredResolution: vi.fn(),
    getStats: vi.fn().mockResolvedValue({}),
    setStyle: vi.fn(),
    videoWidth: vi.fn().mockReturnValue(640),
    videoHeight: vi.fn().mockReturnValue(480),
    restrictFrameRate: false,
    ...overrides,
  }) as unknown as Subscriber;
}

/**
 * Mock device list for testing.
 */
export const mockDevices: Device[] = [
  {
    deviceId: 'default-audio',
    label: 'Default Audio Input',
    kind: 'audioInput',
  },
  {
    deviceId: 'default-video',
    label: 'Default Video Input',
    kind: 'videoInput',
  },
];

/**
 * Mock initPublisher function.
 */
export const mockInitPublisher = vi.fn(
  (
    _targetElement?: HTMLElement | string | null,
    _properties?: Record<string, unknown>,
    _callback?: (error?: Error) => void
  ): Publisher => {
    const publisher = createMockPublisher();
    if (_callback) {
      setTimeout(() => _callback(), 0);
    }
    return publisher;
  }
);

/**
 * Mock initSession function.
 */
export const mockInitSession = vi.fn((_apiKey: string, _sessionId: string): Session => {
  return createMockSession();
});

/**
 * Mock hasMediaProcessorSupport function.
 */
export const mockHasMediaProcessorSupport = vi.fn((): boolean => true);

/**
 * Mock getDevices function.
 */
export const mockGetDevices = vi.fn((): Promise<Device[]> => {
  return Promise.resolve(mockDevices);
});

/**
 * Mock getSupportedCodecs function.
 */
export const mockGetSupportedCodecs = vi.fn((): Promise<{ videoCodecs: string[] }> => {
  return Promise.resolve({ videoCodecs: ['VP8', 'H264'] });
});

/**
 * Mock setAudioOutputDevice function.
 */
export const mockSetAudioOutputDevice = vi.fn((_deviceId: string): Promise<void> => {
  return Promise.resolve();
});

/**
 * Mock getActiveAudioOutputDevice function.
 */
export const mockGetActiveAudioOutputDevice = vi.fn((): Promise<string> => {
  return Promise.resolve('default');
});

/**
 * Mock getAudioOutputDevices function.
 */
export const mockGetAudioOutputDevices = vi.fn((): Promise<MediaDeviceInfo[]> => {
  return Promise.resolve([
    {
      deviceId: 'default',
      label: 'Default Audio Output',
      kind: 'audiooutput',
      groupId: 'default',
      toJSON: () => ({}),
    } as MediaDeviceInfo,
  ]);
});

/**
 * Complete mock of the @vonage/client-sdk-video module.
 */
const mockVonageVideoSDK = {
  initPublisher: mockInitPublisher,
  initSession: mockInitSession,
  hasMediaProcessorSupport: mockHasMediaProcessorSupport,
  getDevices: mockGetDevices,
  getSupportedCodecs: mockGetSupportedCodecs,
  setAudioOutputDevice: mockSetAudioOutputDevice,
  getActiveAudioOutputDevice: mockGetActiveAudioOutputDevice,
  getAudioOutputDevices: mockGetAudioOutputDevices,

  // Export factory functions for creating mock instances
  createMockPublisher,
  createMockSession,
  createMockSubscriber,

  // Export mock data
  mockDevices,

  // Common constants
  VideoFilter: {} as VideoFilter,
};

export default mockVonageVideoSDK;
