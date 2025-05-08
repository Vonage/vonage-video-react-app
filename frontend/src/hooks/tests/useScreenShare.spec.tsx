import { Mock, beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Publisher, initPublisher } from '@vonage/client-sdk-video';
import useScreenShare from '../useScreenShare';
import useSessionContext from '../useSessionContext';
import useUserContext from '../useUserContext';
import VonageVideoClient from '../../utils/VonageVideoClient';

// Mocking dependencies
vi.mock('@vonage/client-sdk-video', () => ({
  initPublisher: vi.fn(),
}));

vi.mock('../useSessionContext');
vi.mock('../useUserContext');
const mockPublish = vi.fn();
const mockUnpublish = vi.fn();

describe('useScreenSharing', () => {
  let mockVonageVideoClient: Partial<VonageVideoClient>;
  let mockPublisher: Partial<Publisher>;
  let mockUserContext: { user: { defaultSettings: { name: string } } };

  beforeEach(() => {
    mockVonageVideoClient = {
      on: vi.fn(),
    } as unknown as VonageVideoClient;

    mockPublisher = {
      on: vi.fn() as Mock, // NOSONAR
      destroy: vi.fn(),
    };

    mockUserContext = { user: { defaultSettings: { name: 'TestUser' } } };

    (useSessionContext as Mock).mockReturnValue({
      vonageVideoClient: mockVonageVideoClient,
      publish: mockPublish,
      unpublish: mockUnpublish,
    });
    (useUserContext as Mock).mockReturnValue(mockUserContext);
    (initPublisher as Mock).mockReturnValue(mockPublisher as Publisher);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes screen sharing publisher and publishes', async () => {
    const { result } = renderHook(() => useScreenShare());

    await act(async () => {
      // toggling screen share on
      await result.current.toggleShareScreen();
    });

    expect(initPublisher).toHaveBeenCalledWith(
      undefined,
      {
        videoSource: 'screen',
        insertDefaultUI: false,
        videoContentHint: 'detail',
        name: "TestUser's screen",
      },
      expect.any(Function)
    );
    expect(mockPublisher.on).toHaveBeenCalledWith('streamCreated', expect.any(Function));
    expect(mockPublisher.on).toHaveBeenCalledWith('streamDestroyed', expect.any(Function));
    expect(mockPublisher.on).toHaveBeenCalledWith('mediaStopped', expect.any(Function));
  });

  it('unpublishes screen sharing when already sharing', async () => {
    const { result } = renderHook(() => useScreenShare());

    await act(async () => {
      // toggling screen share on
      await result.current.toggleShareScreen();
      // toggling screen share off
      await result.current.toggleShareScreen();
    });

    expect(result.current.isSharingScreen).toBe(false);
  });

  it('does not initialize publisher if session is null', async () => {
    (useSessionContext as Mock).mockReturnValue({ session: null });

    const { result } = renderHook(() => useScreenShare());

    await act(async () => {
      await result.current.toggleShareScreen();
    });

    expect(initPublisher).not.toHaveBeenCalled();
  });
});
