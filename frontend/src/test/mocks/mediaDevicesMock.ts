/**
 * Creates a strict Partial<MediaDevices> mock that throws descriptive errors
 * for unmocked methods. Use this to make tests explicit about which navigator
 * APIs are actually used.
 *
 * @example
 * const mediaDevicesMock = createMediaDevicesMock();
 *
 * beforeEach(() => {
 *   Object.defineProperty(global.navigator, 'mediaDevices', {
 *     writable: true,
 *     value: mediaDevicesMock,
 *   });
 *
 *   setupMediaDevicesMock(mediaDevicesMock);
 * });
 */
export function createMediaDevicesMock(): Partial<MediaDevices> {
  return {
    ondevicechange: null,
    enumerateDevices() {
      throw new Error('enumerateDevices was called but not mocked.');
    },
    addEventListener() {
      throw new Error('addEventListener was called but not mocked.');
    },
    removeEventListener() {
      throw new Error('removeEventListener was called but not mocked.');
    },
  };
}

/**
 * Sets up common spies for MediaDevices mock with default implementations.
 * Call this in beforeEach after assigning the mock to navigator.mediaDevices.
 *
 * @example
 * beforeEach(() => {
 *   Object.defineProperty(global.navigator, 'mediaDevices', {
 *     writable: true,
 *     value: mediaDevicesMock,
 *   });
 *
 *   setupMediaDevicesMock(mediaDevicesMock, vi);
 * });
 *
 * @example With custom implementations
 * setupMediaDevicesMock(mediaDevicesMock, vi, {
 *   addEventListener: (event, listener) => {
 *     deviceChangeListener.on(event, listener);
 *   },
 * });
 */
export function setupMediaDevicesMock(
  mock: ReturnType<typeof createMediaDevicesMock>,
  vi: {
    spyOn: <T, K extends keyof T>(
      object: T,
      method: K
    ) => { mockImplementation: (impl: T[K]) => void };
  },
  options?: {
    enumerateDevices?: () => Promise<MediaDeviceInfo[]>;
    addEventListener?: (event: string, listener: EventListenerOrEventListenerObject) => void;
    removeEventListener?: (event: string, listener: EventListenerOrEventListenerObject) => void;
  }
) {
  vi.spyOn(mock, 'addEventListener').mockImplementation(options?.addEventListener ?? (() => {}));
  vi.spyOn(mock, 'removeEventListener').mockImplementation(
    options?.removeEventListener ?? (() => {})
  );
  vi.spyOn(mock, 'enumerateDevices').mockImplementation(
    options?.enumerateDevices ?? (() => Promise.resolve([]))
  );
}
