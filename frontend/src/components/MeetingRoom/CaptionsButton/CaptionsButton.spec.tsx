import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import { render as renderBase, screen, act, waitFor } from '@testing-library/react';
import { Subscriber } from '@vonage/client-sdk-video';
import { ReactElement } from 'react';
import { SessionContextType } from '@Context/SessionProvider/session';
import useSessionContext from '@hooks/useSessionContext';
import { SubscriberWrapper } from '@app-types/session';
import { makeTestProvider, providers } from '@test/providers';
import CaptionsButton, { CaptionsState } from './CaptionsButton';
import { env } from '../../../env';
import type { VideoClient } from '@core/services';

vi.mock('@hooks/useSessionContext');

const mockVideoClient: VideoClient = {
  ensureCaptionsEnabled: vi.fn(),
  disableCaptions: vi.fn(),
} as unknown as VideoClient;

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;

describe('CaptionsButton', () => {
  const mockHandleCloseMenu = vi.fn();
  const mockSetIsUserCaptionsEnabled = vi.fn();
  const mockSetCaptionsErrorResponse = vi.fn();

  const mockCaptionsState = {
    isUserCaptionsEnabled: false,
    setIsUserCaptionsEnabled: mockSetIsUserCaptionsEnabled,
    setCaptionsErrorResponse: mockSetCaptionsErrorResponse,
  } as CaptionsState;
  const mockedSessionKey = 'test-session-key';
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
    (mockVideoClient.ensureCaptionsEnabled as Mock).mockResolvedValue({ captionsId: '1-2-3-4' });
    (mockVideoClient.disableCaptions as Mock).mockResolvedValue({});
    sessionContext = {
      subscriberWrappers: [createSubscriberWrapper('subscriber-1')],
      sessionKey: mockedSessionKey,
      connected: true,
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContext as unknown as SessionContextType);
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
    env.partialUpdate({
      ALLOW_CAPTIONS: true,
    });
    render(<CaptionsButton handleClick={mockHandleCloseMenu} captionsState={mockCaptionsState} />);

    act(() => screen.getByTestId('captions-button').click());

    await waitFor(() => {
      expect(mockVideoClient.ensureCaptionsEnabled).toHaveBeenCalledWith({
        sessionKey: mockedSessionKey,
      });
    });
  });

  it('is not rendered when allowCaptions is false', () => {
    env.partialUpdate({
      ALLOW_CAPTIONS: false,
    });
    render(<CaptionsButton handleClick={mockHandleCloseMenu} captionsState={mockCaptionsState} />);

    expect(screen.queryByTestId('captions-button')).not.toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([providers.runtime], {
    runtimeContext: { videoClient: mockVideoClient },
  });

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
