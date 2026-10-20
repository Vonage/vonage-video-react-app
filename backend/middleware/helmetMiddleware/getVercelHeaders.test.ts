import { describe, expect, it } from 'vitest';
import getVercelHeaders from './getVercelHeaders';

describe('Vercel CDN security policy', () => {
  it('protects pages while allowing Vonage media and cross-origin component assets', () => {
    const headers = getVercelHeaders();
    expect(headers['content-security-policy']).toContain("frame-ancestors 'self'");
    expect(headers['content-security-policy']).toContain('https://static.opentok.com');
    expect(headers['content-security-policy']).toContain('wss://*.vonage.com');
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['cross-origin-resource-policy']).toBe('cross-origin');
    expect(headers['cross-origin-embedder-policy']).toBeUndefined();
    expect(headers['X-Robots-Tag']).toBe('noindex, nofollow');
  });
});
