import { describe, expect, it, beforeEach } from 'vitest';

describe('correctWebRTCAdapterErrors', () => {
  beforeEach(() => {
    localStorage.clear();

    class MockRTCPeerConnection {
      addEventListener() {}
      removeEventListener() {}
    }

    Object.defineProperty(globalThis, 'RTCPeerConnection', {
      value: MockRTCPeerConnection,
      writable: true,
      configurable: true,
    });
  });

  it('makes addEventListener and removeEventListener writable and configurable', async () => {
    await import('./webrtc-adapter.patch');

    const addEventListenerDescriptor = Object.getOwnPropertyDescriptor(
      RTCPeerConnection.prototype,
      'addEventListener'
    );

    const removeEventListenerDescriptor = Object.getOwnPropertyDescriptor(
      RTCPeerConnection.prototype,
      'removeEventListener'
    );

    expect(addEventListenerDescriptor?.writable).toBe(true);
    expect(addEventListenerDescriptor?.configurable).toBe(true);

    expect(removeEventListenerDescriptor?.writable).toBe(true);
    expect(removeEventListenerDescriptor?.configurable).toBe(true);
  });
});
