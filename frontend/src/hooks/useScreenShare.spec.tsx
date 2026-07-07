import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockPublisher = {
  element: { classList: { add: vi.fn() } },
  on: vi.fn(),
  destroy: vi.fn(),
};

const mockInitPublisher = vi.fn((..._args: unknown[]) => mockPublisher);
vi.mock('@vonage/client-sdk-video', () => ({
  __esModule: true,
  initPublisher: (...args: unknown[]) => mockInitPublisher(...args),
}));

const mockPublish = vi.fn();
const mockUnpublish = vi.fn();
const mockVonageVideoClient = { on: vi.fn(), off: vi.fn() };
vi.mock('./useSessionContext', () => ({
  default: () => ({
    vonageVideoClient: mockVonageVideoClient,
    publish: mockPublish,
    unpublish: mockUnpublish,
  }),
}));

vi.mock('./useUserContext', () => ({
  default: () => ({ user: { defaultSettings: { name: 'Ada' } } }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import useScreenShare from './useScreenShare';

describe('useScreenShare', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('destroys the publisher and resets state when publishing the screen share fails', async () => {
    mockPublish.mockRejectedValue(new Error('permission denied'));

    const { result } = renderHook(() => useScreenShare());

    await act(async () => {
      await result.current.toggleShareScreen();
    });

    expect(mockPublish).toHaveBeenCalled();
    // The publisher must be destroyed so the screen capture actually stops.
    expect(mockPublisher.destroy).toHaveBeenCalled();
    expect(result.current.isSharingScreen).toBe(false);
    // The stream-created listener must not be registered when publishing failed.
    expect(mockVonageVideoClient.on).not.toHaveBeenCalledWith(
      'screenshareStreamCreated',
      expect.anything()
    );
  });

  it('registers the screenshareStreamCreated listener on a successful publish', async () => {
    mockPublish.mockResolvedValue(undefined);

    const { result } = renderHook(() => useScreenShare());

    await act(async () => {
      await result.current.toggleShareScreen();
    });

    expect(mockPublisher.destroy).not.toHaveBeenCalled();
    expect(mockVonageVideoClient.on).toHaveBeenCalledWith(
      'screenshareStreamCreated',
      expect.any(Function)
    );
  });
});
