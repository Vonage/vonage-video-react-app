import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import { render as renderBase, screen, act } from '@testing-library/react';
import { ReactElement } from 'react';
import useSessionContext from '@hooks/useSessionContext';
import { SessionContextType } from '@Context/SessionProvider/session';
import { makeTestProvider, providers } from '@test/providers';
import PostCallTranscriptionButton from './PostCallTranscriptionButton';
import { env } from '../../../env';
import type { VideoClient } from '@core/services';

vi.mock('@hooks/useSessionContext');

const mockVideoClient: VideoClient = {
  startArchive: vi.fn(),
  stopArchive: vi.fn().mockResolvedValue(undefined),
} as unknown as VideoClient;

describe('PostCallTranscriptionButton', () => {
  const mockHandleCloseMenu = vi.fn();
  const mockedSessionKey = 'test-session-key';
  let sessionContext: SessionContextType;

  const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
  const testArchiveId = 'test-transcription-archive-id';

  beforeEach(() => {
    vi.clearAllMocks();
    (mockVideoClient.stopArchive as Mock).mockResolvedValue(undefined);

    sessionContext = {
      subscriberWrappers: [],
      transcriptionArchiveId: null,
      setTranscriptionArchiveId: vi.fn(),
      markTranscriptionStartRequestedBySelf: vi.fn(),
      resetTranscriptionStartRequestedBySelf: vi.fn(),
      sessionKey: mockedSessionKey,
      connected: true,
    } as unknown as SessionContextType;

    mockUseSessionContext.mockReturnValue(sessionContext as unknown as SessionContextType);
  });

  it('renders the button correctly', () => {
    render(<PostCallTranscriptionButton handleClick={mockHandleCloseMenu} />);
    expect(screen.getByTestId('post-call-transcription-button')).toBeInTheDocument();
  });

  it('opens the modal when the button is clicked', () => {
    render(<PostCallTranscriptionButton handleClick={mockHandleCloseMenu} />);
    act(() => screen.getByTestId('post-call-transcription-button').click());
    expect(screen.getByText('Start Transcription?')).toBeInTheDocument();
  });

  it('triggers the start transcription with the transcription intent when button is pressed', async () => {
    vi.useFakeTimers();
    (mockVideoClient.startArchive as Mock).mockResolvedValue({ id: testArchiveId });
    render(<PostCallTranscriptionButton handleClick={mockHandleCloseMenu} />);

    act(() => screen.getByTestId('post-call-transcription-button').click());
    expect(screen.getByText('Start Transcription?')).toBeInTheDocument();

    act(() => screen.getByTestId('popup-dialog-primary-button').click());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockVideoClient.startArchive).toHaveBeenCalledWith({
      sessionKey: mockedSessionKey,
      withTranscription: true,
    });

    vi.useRealTimers();
  });

  it('shows stop transcription dialog when a transcription is active', () => {
    mockUseSessionContext.mockReturnValue({
      subscriberWrappers: [],
      transcriptionArchiveId: testArchiveId,
      setTranscriptionArchiveId: vi.fn(),
      markTranscriptionStartRequestedBySelf: vi.fn(),
      resetTranscriptionStartRequestedBySelf: vi.fn(),
    } as unknown as SessionContextType);

    render(<PostCallTranscriptionButton handleClick={mockHandleCloseMenu} />);
    act(() => screen.getByTestId('post-call-transcription-button').click());
    expect(screen.getByText('Stop Transcription?')).toBeInTheDocument();
  });

  it('triggers stop transcription with the explicit archive id when a transcription is active', async () => {
    vi.useFakeTimers();
    mockUseSessionContext.mockReturnValue({
      subscriberWrappers: [],
      transcriptionArchiveId: testArchiveId,
      setTranscriptionArchiveId: vi.fn(),
      markTranscriptionStartRequestedBySelf: vi.fn(),
      resetTranscriptionStartRequestedBySelf: vi.fn(),
      sessionKey: mockedSessionKey,
      connected: true,
    } as unknown as SessionContextType);

    render(<PostCallTranscriptionButton handleClick={mockHandleCloseMenu} />);

    act(() => screen.getByTestId('post-call-transcription-button').click());
    expect(screen.getByText('Stop Transcription?')).toBeInTheDocument();

    act(() => screen.getByTestId('popup-dialog-primary-button').click());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockVideoClient.stopArchive).toHaveBeenCalledWith({
      sessionKey: mockedSessionKey,
      archiveType: 'transcription',
    });

    vi.useRealTimers();
  });

  it('is not rendered when allowPostCallTranscription is disabled', () => {
    env.partialUpdate({
      ALLOW_POST_CALL_TRANSCRIPTION: false,
    });
    render(<PostCallTranscriptionButton handleClick={mockHandleCloseMenu} />);

    expect(screen.queryByTestId('post-call-transcription-button')).not.toBeInTheDocument();
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
