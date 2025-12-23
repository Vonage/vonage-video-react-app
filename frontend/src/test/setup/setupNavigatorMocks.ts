import { vi } from 'vitest';

type SetupNavigatorMocksOptions = {
  mediaDevices?: {
    enumerateDevices?: () => Promise<MediaDeviceInfo[]>;
    addEventListener?: (event: string, listener: EventListener) => void;
    removeEventListener?: (event: string, listener: EventListener) => void;
  };
  permissions?: {
    query?: (permissionDesc: PermissionDescriptor) => Promise<PermissionStatus>;
  };
};

/**
 * Sets up mock navigator objects for testing hooks that depend on navigator APIs.
 * Mocks navigator.mediaDevices and navigator.permissions with sensible defaults.
 *
 * @param options - Optional overrides for default mock implementations
 * @example
 * // Basic usage with defaults
 * setupNavigatorMocks();
 *
 * @example
 * // With custom device list
 * setupNavigatorMocks({
 *   mediaDevices: {
 *     enumerateDevices: vi.fn(() => Promise.resolve(mockDevices))
 *   }
 * });
 */
export const setupNavigatorMocks = (options?: SetupNavigatorMocksOptions) => {
  // Mock navigator.mediaDevices for useDevices hook
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    writable: true,
    value: {
      enumerateDevices: options?.mediaDevices?.enumerateDevices ?? vi.fn(() => Promise.resolve([])),
      addEventListener: options?.mediaDevices?.addEventListener ?? vi.fn(),
      removeEventListener: options?.mediaDevices?.removeEventListener ?? vi.fn(),
    },
  });

  // Mock navigator.permissions for usePermissions hook
  Object.defineProperty(globalThis.navigator, 'permissions', {
    writable: true,
    value: {
      query:
        options?.permissions?.query ??
        vi.fn(() => Promise.resolve({ state: 'granted', onchange: null })),
    },
  });
};
