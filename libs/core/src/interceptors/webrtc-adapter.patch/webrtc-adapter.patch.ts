(function correctWebRTCAdapterErrors() {
  const shouldOverride = localStorage.getItem('error-test');
  if (shouldOverride) return;

  const NativeRTCPeerConnection = globalThis.RTCPeerConnection;
  if (!NativeRTCPeerConnection) return;

  Object.defineProperty(NativeRTCPeerConnection.prototype, 'addEventListener', {
    value: NativeRTCPeerConnection.prototype.addEventListener,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(NativeRTCPeerConnection.prototype, 'removeEventListener', {
    value: NativeRTCPeerConnection.prototype.removeEventListener,
    writable: true,
    configurable: true,
  });
})();

export {};
