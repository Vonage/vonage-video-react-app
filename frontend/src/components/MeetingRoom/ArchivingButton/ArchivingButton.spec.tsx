import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import { render as renderBase, screen, act } from '@testing-library/react';
import { ReactElement } from 'react';
import useSessionContext from '@hooks/useSessionContext';
import { SessionContextType } from '@Context/SessionProvider/session';
import { makeTestProvider, providers } from '@test/providers';
import ArchivingButton from './ArchivingButton';
import { env } from '../../../env';
import type { VideoClient } from '@core/services';

vi.mock('@hooks/useSessionContext');

const mockVideoClient: VideoClient = {
  startArchive: vi.fn(),
  stopArchive: vi.fn(),
} as unknown as VideoClient;

describe('ArchivingButton', () => {
  const mockHandleCloseMenu = vi.fn();
  const mockedSessionKey = 'test-session-key';
  let sessionContext: SessionContextType;

  const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
  const testArchiveId = 'test-archive-id';

  beforeEach(() => {
    vi.clearAllMocks();
    sessionContext = {
      subscriberWrappers: [],
      archiveId: null,
      markArchiveStartRequestedBySelf: vi.fn(),
      resetArchiveStartRequestedBySelf: vi.fn(),
      sessionKey: mockedSessionKey,
      connected: true,
    } as unknown as SessionContextType;

    mockUseSessionContext.mockReturnValue(sessionContext as unknown as SessionContextType);
  });

  it('renders the button correctly', () => {
    render(<ArchivingButton handleClick={mockHandleCloseMenu} />);
    expect(screen.getByTestId('archiving-button')).toBeInTheDocument();
  });

  it('opens the modal when the button is clicked', () => {
    render(<ArchivingButton handleClick={mockHandleCloseMenu} />);
    act(() => screen.getByTestId('archiving-button').click());
    expect(screen.getByText('Start Recording?')).toBeInTheDocument();
  });

  it('triggers the start archiving when button is pressed', async () => {
    vi.useFakeTimers();
    (mockVideoClient.startArchive as Mock).mockResolvedValue({ data: { success: true } });
    render(<ArchivingButton handleClick={mockHandleCloseMenu} />);

    act(() => screen.getByTestId('archiving-button').click());
    expect(screen.getByText('Start Recording?')).toBeInTheDocument();

    // click the button to start archiving
    act(() => screen.getByTestId('popup-dialog-primary-button').click());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockVideoClient.startArchive).toHaveBeenCalledWith({ sessionKey: mockedSessionKey });

    vi.useRealTimers();
  });

  it('shows stop recording dialog when archiving is active', () => {
    mockUseSessionContext.mockReturnValue({
      subscriberWrappers: [],
      archiveId: 'test-archive-id',
      markArchiveStartRequestedBySelf: vi.fn(),
      resetArchiveStartRequestedBySelf: vi.fn(),
    } as unknown as SessionContextType);

    render(<ArchivingButton handleClick={mockHandleCloseMenu} />);
    act(() => screen.getByTestId('archiving-button').click());
    expect(screen.getByText('Stop Recording?')).toBeInTheDocument();
  });

  it('triggers stop archiving when recording is active', async () => {
    vi.useFakeTimers();
    mockUseSessionContext.mockReturnValue({
      subscriberWrappers: [],
      archiveId: testArchiveId,
      markArchiveStartRequestedBySelf: vi.fn(),
      resetArchiveStartRequestedBySelf: vi.fn(),
      sessionKey: mockedSessionKey,
      connected: true,
    } as unknown as SessionContextType);

    render(<ArchivingButton handleClick={mockHandleCloseMenu} />);

    act(() => screen.getByTestId('archiving-button').click());
    expect(screen.getByText('Stop Recording?')).toBeInTheDocument();

    // click the button to stop archiving
    act(() => screen.getByTestId('popup-dialog-primary-button').click());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockVideoClient.stopArchive).toHaveBeenCalledWith({
      sessionKey: mockedSessionKey,
      archiveId: testArchiveId,
    });

    vi.useRealTimers();
  });

  it('is not rendered when allowArchiving is disabled', () => {
    env.partialUpdate({
      ALLOW_ARCHIVING: false,
    });
    render(<ArchivingButton handleClick={mockHandleCloseMenu} />);

    expect(screen.queryByTestId('archiving-button')).not.toBeInTheDocument();
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
