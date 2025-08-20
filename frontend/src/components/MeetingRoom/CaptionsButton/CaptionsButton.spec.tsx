import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import { Subscriber } from '@vonage/client-sdk-video';
import { MemoryRouter } from 'react-router-dom';
import { enableCaptions, disableCaptions } from '../../../api/captions';
import CaptionsButton, { BackendFeatureState } from './CaptionsButton';
import useRoomName from '../../../hooks/useRoomName';
import { SessionContextType } from '../../../Context/SessionProvider/session';
import useSessionContext from '../../../hooks/useSessionContext';
import { SubscriberWrapper } from '../../../types/session';

vi.mock('../../../hooks/useSessionContext');
vi.mock('../../../hooks/useRoomName');
vi.mock('../../../api/captions', () => ({
  enableCaptions: vi.fn(),
  disableCaptions: vi.fn(),
}));

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;

describe('CaptionsButton', () => {
  const mockHandleCloseMenu = vi.fn();
  const mockSetIsUserCaptionsEnabled = vi.fn();
  const mockSetEnableActionErrorResponse = vi.fn();

  const mockCaptionsState = {
    isUserCaptionsEnabled: false,
    setIsUserCaptionsEnabled: mockSetIsUserCaptionsEnabled,
    setEnableActionErrorResponse: mockSetEnableActionErrorResponse,
  } as BackendFeatureState;
  const mockedRoomName = 'test-room-name';
  let sessionContext: SessionContextType;

  const createSubscriberWrapper = (id: string): SubscriberWrapper => {
    const mockSubscriber = {
      id,
      on: vi.fn(),
      off: vi.fn(),
      videoWidth: () => 1280,
      videoHeight: () => 720,
      subscribeToVideo: () => {},
      stream: {
        streamId: id,
      },
    } as unknown as Subscriber;
    return {
      id,
      element: document.createElement('video'),
      isScreenshare: false,
      isPinned: false,
      subscriber: mockSubscriber,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRoomName as Mock).mockReturnValue(mockedRoomName);
    (enableCaptions as Mock).mockResolvedValue({
      data: { captions: { captionsId: '1-2-3-4', status: 200 } },
    } as AxiosResponse);
    (disableCaptions as Mock).mockResolvedValue({
      data: { status: 200 },
    } as AxiosResponse);
    sessionContext = {
      subscriberWrappers: [createSubscriberWrapper('subscriber-1')],
      tokenRole: 'admin',
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContext as unknown as SessionContextType);
  });

  it('renders the button correctly', () => {
    render(
      <MemoryRouter>
        <CaptionsButton
          handleClick={mockHandleCloseMenu}
          backendFeatureState={{ ...mockCaptionsState, isUserCaptionsEnabled: true }}
        />
      </MemoryRouter>
    );
    expect(screen.getByTestId('captions-button')).toBeInTheDocument();
  });

  it('turns the captions on when button is pressed', async () => {
    render(
      <MemoryRouter>
        <CaptionsButton handleClick={mockHandleCloseMenu} backendFeatureState={mockCaptionsState} />
      </MemoryRouter>
    );
    act(() => screen.getByTestId('captions-button').click());

    await waitFor(() => {
      expect(enableCaptions).toHaveBeenCalledWith(mockedRoomName, 'admin');
    });
  });
});
