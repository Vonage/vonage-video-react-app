const mediaDevicesMock: typeof navigator.mediaDevices = {
  ondevicechange: null,
  enumerateDevices: function (): Promise<MediaDeviceInfo[]> {
    throw new Error(
      'enumerateDevices() must be mocked explicitly in your test. ' +
        'Use vi.spyOn(globalThis.navigator.mediaDevices, "enumerateDevices").mockResolvedValue(...) ' +
        'or vi.spyOn(globalThis.navigator.mediaDevices, "enumerateDevices").mockImplementation(...) ' +
        'to provide the mock you need for your specific test.'
    );
  },
  getDisplayMedia: function (): Promise<MediaStream> {
    throw new Error(
      'getDisplayMedia() must be mocked explicitly in your test. ' +
        'Use vi.spyOn(globalThis.navigator.mediaDevices, "getDisplayMedia").mockResolvedValue(...) ' +
        'or vi.spyOn(globalThis.navigator.mediaDevices, "getDisplayMedia").mockImplementation(...) ' +
        'to provide the mock you need for your specific test.'
    );
  },
  getSupportedConstraints: function (): MediaTrackSupportedConstraints {
    throw new Error(
      'getSupportedConstraints() must be mocked explicitly in your test. ' +
        'Use vi.spyOn(globalThis.navigator.mediaDevices, "getSupportedConstraints").mockReturnValue(...) ' +
        'to provide the mock you need for your specific test.'
    );
  },
  getUserMedia: function (): Promise<MediaStream> {
    throw new Error(
      'getUserMedia() must be mocked explicitly in your test. ' +
        'Use vi.spyOn(globalThis.navigator.mediaDevices, "getUserMedia").mockResolvedValue(...) ' +
        'or vi.spyOn(globalThis.navigator.mediaDevices, "getUserMedia").mockImplementation(...) ' +
        'to provide the mock you need for your specific test.'
    );
  },
  addEventListener: function (): void {
    throw new Error(
      'addEventListener() must be mocked explicitly in your test. ' +
        'Use vi.spyOn(globalThis.navigator.mediaDevices, "addEventListener").mockImplementation(...) ' +
        'to provide the mock you need for your specific test.'
    );
  },
  removeEventListener: function (): void {
    throw new Error(
      'removeEventListener() must be mocked explicitly in your test. ' +
        'Use vi.spyOn(globalThis.navigator.mediaDevices, "removeEventListener").mockImplementation(...) ' +
        'to provide the mock you need for your specific test.'
    );
  },
  dispatchEvent: function (): boolean {
    throw new Error(
      'dispatchEvent() must be mocked explicitly in your test. ' +
        'Use vi.spyOn(globalThis.navigator.mediaDevices, "dispatchEvent").mockReturnValue(...) ' +
        'to provide the mock you need for your specific test.'
    );
  },
};

export default mediaDevicesMock;
