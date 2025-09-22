import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import { Subscriber } from '@vonage/client-sdk-video';
import { enableCaptions, disableCaptions } from '../../../api/captions';
import CaptionsButton, { CaptionsState } from './CaptionsButton';
import useRoomName from '../../../hooks/useRoomName';
import { SessionContextType } from '../../../Context/SessionProvider/session';
import useSessionContext from '../../../hooks/useSessionContext';
import { SubscriberWrapper } from '../../../types/session';
import useConfigContext from '../../../hooks/useConfigContext';
import { ConfigContextType } from '../../../Context/ConfigProvider';

vi.mock('../../../hooks/useSessionContext');
vi.mock('../../../hooks/useRoomName');
vi.mock('../../../api/captions', () => ({
  enableCaptions: vi.fn(),
  disableCaptions: vi.fn(),
}));
vi.mock('../../../hooks/useConfigContext');

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const mockUseConfigContext = useConfigContext as Mock<[], ConfigContextType>;

describe('CaptionsButton', () => {
  const mockHandleCloseMenu = vi.fn();
  const mockSetIsUserCaptionsEnabled = vi.fn();
  const mockSetCaptionsErrorResponse = vi.fn();

  const mockCaptionsState = {
    isUserCaptionsEnabled: false,
    setIsUserCaptionsEnabled: mockSetIsUserCaptionsEnabled,
    setCaptionsErrorResponse: mockSetCaptionsErrorResponse,
  } as CaptionsState;
  const mockedRoomName = 'test-room-name';
  let sessionContext: SessionContextType;
  let configContext: ConfigContextType;

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
    } as unknown as SessionContextType;
    configContext = {
      meetingRoomSettings: {
        showCaptionsButton: true,
      },
    } as Partial<ConfigContextType> as ConfigContextType;
    mockUseSessionContext.mockReturnValue(sessionContext as unknown as SessionContextType);
    mockUseConfigContext.mockReturnValue(configContext);
  });

  it('renders the button correctly', () => {
    render(
      <CaptionsButton
        handleClick={mockHandleCloseMenu}
        captionsState={{ ...mockCaptionsState, isUserCaptionsEnabled: true }}
      />
    );
    expect(screen.getByTestId('captions-button')).toBeInTheDocument();
  });

  it('turns the captions on when button is pressed', async () => {
    render(<CaptionsButton handleClick={mockHandleCloseMenu} captionsState={mockCaptionsState} />);
    act(() => screen.getByTestId('captions-button').click());

    await waitFor(() => {
      expect(enableCaptions).toHaveBeenCalledWith(mockedRoomName);
    });
  });

  it('is not rendered when showCaptionsButton is false', () => {
    mockUseConfigContext.mockReturnValue({
      meetingRoomSettings: {
        showCaptionsButton: false,
      },
    } as Partial<ConfigContextType> as ConfigContextType);
    render(<CaptionsButton handleClick={mockHandleCloseMenu} captionsState={mockCaptionsState} />);
    expect(screen.queryByTestId('captions-button')).not.toBeInTheDocument();
  });
});
