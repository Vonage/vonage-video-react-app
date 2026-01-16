const mediaDevicesMock: typeof navigator.mediaDevices = {
  ondevicechange: null,
  enumerateDevices: function (): Promise<MediaDeviceInfo[]> {
    throw new Error('Function not implemented.');
  },
  getDisplayMedia: function (): Promise<MediaStream> {
    throw new Error('Function not implemented.');
  },
  getSupportedConstraints: function (): MediaTrackSupportedConstraints {
    throw new Error('Function not implemented.');
  },
  getUserMedia: function (): Promise<MediaStream> {
    throw new Error('Function not implemented.');
  },
  addEventListener: function (): void {
    throw new Error('Function not implemented.');
  },
  removeEventListener: function (): void {
    throw new Error('Function not implemented.');
  },
  dispatchEvent: function (): boolean {
    throw new Error('Function not implemented.');
  },
};

export default mediaDevicesMock;
