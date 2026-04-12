/**
 * Decodes a JWT without verifying its signature, and returns the payload as an object.
 */
const decodeJwt = <T>(token: string): T => {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const base64Url = parts[1];

  // Fix padding
  const pad = '='.repeat((4 - (base64Url.length % 4)) % 4);

  // Convert Base64URL → Base64
  const base64 = (base64Url + pad).replace(/-/g, '+').replace(/_/g, '/');

  // Decode safely
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const jsonString = new TextDecoder().decode(bytes);

  const payload = JSON.parse(jsonString) as T;

  return payload;
};

export default decodeJwt;
