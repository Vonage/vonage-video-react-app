import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionStorage } from '../storage/sessionStorage';
import VcrSessionStorage from '../storage/vcrSessionStorage';

describe('getSessionStorageService', () => {
  afterEach(() => {
    vi.resetModules(); // Clear module cache between tests
    delete process.env.VCR_PORT; // Clean up the environment variable after each test
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  it('should return VcrSessionStorage when isVcr is true', async () => {
    // Mock the environment variable to simulate VCR environment
    process.env.VCR_PORT = '1234';

    const { default: getSessionStorageService } = await import('../sessionStorageService');

    // Call the function to test
    const sessionStorage: SessionStorage = getSessionStorageService();

    // Assert it returns VcrSessionStorage
    expect(sessionStorage).toBeInstanceOf(VcrSessionStorage);
  });

  it('should return UpstashRedisSessionStorage when an Upstash Redis database is configured', async () => {
    process.env.KV_REST_API_URL = 'https://example.upstash.io';
    process.env.KV_REST_API_TOKEN = 'token';

    const { default: getSessionStorageService } = await import('../sessionStorageService');
    const { default: UpstashRedisSessionStorage } =
      await import('../storage/upstashRedisSessionStorage');

    expect(getSessionStorageService()).toBeInstanceOf(UpstashRedisSessionStorage);
  });

  it('should return in-memory session storage when not using VCR', async () => {
    const { default: getSessionStorageService } = await import('../sessionStorageService');
    const { default: InMemorySessionStorage } = await import('../storage/inMemorySessionStorage');

    const sessionStorage: SessionStorage = getSessionStorageService();
    expect(sessionStorage).toBeInstanceOf(InMemorySessionStorage);
  });
});
