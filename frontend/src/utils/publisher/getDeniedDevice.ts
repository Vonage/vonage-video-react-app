/**
 * Determines which device an `accessDenied` event's message refers to. The SDK only
 * exposes the device inside this free-text message, and its casing varies by code path —
 * a mid-call permission revocation emits e.g. "microphone permission denied during the
 * call" (lowercase) — so the match must be case-insensitive.
 */
const getDeniedDevice = (accessDeniedMessage: string | undefined): 'microphone' | 'camera' =>
  accessDeniedMessage?.toLowerCase().startsWith('microphone') ? 'microphone' : 'camera';

export default getDeniedDevice;
