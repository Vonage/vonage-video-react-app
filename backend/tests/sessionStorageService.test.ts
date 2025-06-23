import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { SessionStorage } from '../storage/sessionStorage';
import VcrSessionStorage from '../storage/vcrSessionStorage';

describe('getSessionStorageService', () => {
  afterEach(() => {
    jest.resetModules(); // Clear module cache between tests
    delete process.env.VCR_PORT; // Clean up the environment variable after each test
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

  it('should return in memory session storage when not using VCR', async () => {
    const { default: getSessionStorageService } = await import('../sessionStorageService');
    const { default: InMemorySessionStorage } = await import('../storage/inMemorySessionStorage');

    // Call the function to test
    const sessionStorage: SessionStorage = getSessionStorageService();

    // Assert it returns InMemorySessionStorage
    expect(sessionStorage).toBeInstanceOf(InMemorySessionStorage);
  });
});
