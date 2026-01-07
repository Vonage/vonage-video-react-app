import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import PrecallNetworkTestDialog from './PrecallNetworkTestDialog';

type QualityResults = {
  audio?: { mos?: number };
  video?: { mos?: number };
};

vi.mock('@hooks/useRoomName', () => ({
  __esModule: true,
  default: () => 'test-room',
}));

const makeUseNetworkTestMock = () => {
  const state: {
    isTestingQuality: boolean;
    qualityResults: QualityResults | null;
    error: { name: string; message: string } | null;
  } = {
    isTestingQuality: false,
    qualityResults: null,
    error: null,
  };
  return {
    state,
    testQuality: vi.fn().mockResolvedValue(undefined),
    stopTest: vi.fn(),
    clearResults: vi.fn(),
  };
};

const useNetworkTestMock = makeUseNetworkTestMock();

vi.mock('@hooks/useNetworkTest', () => ({
  __esModule: true,
  default: () => useNetworkTestMock,
}));

describe('PrecallNetworkTestDialog', () => {
  beforeEach(() => {
    useNetworkTestMock.state.isTestingQuality = false;
    useNetworkTestMock.state.qualityResults = null;
    useNetworkTestMock.state.error = null;
    useNetworkTestMock.testQuality.mockClear();
    useNetworkTestMock.stopTest.mockClear();
    useNetworkTestMock.clearResults.mockClear();
  });

  it('renders dialog when open', () => {
    render(
      <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={() => {}} />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/pre-call network test/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { queryByRole } = render(
      <PrecallNetworkTestDialog
        isPrecallNetworkTestOpen={false}
        setIsPrecallNetworkTestOpen={() => {}}
      />
    );
    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows spinner and Stop button when testing', () => {
    useNetworkTestMock.state.isTestingQuality = true;

    render(
      <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={() => {}} />
    );

    expect(screen.getByText(/stop test/i)).toBeInTheDocument();
  });

  it('clicking Stop stops test and closes dialog', async () => {
    useNetworkTestMock.state.isTestingQuality = true;
    const setOpen = vi.fn();
    render(
      <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={setOpen} />
    );

    await userEvent.click(screen.getByText(/stop test/i));
    expect(useNetworkTestMock.stopTest).toHaveBeenCalled();
    expect(useNetworkTestMock.clearResults).toHaveBeenCalled();
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('renders results with audio/video and scores', () => {
    useNetworkTestMock.state.qualityResults = {
      audio: { mos: 4.2 },
      video: { mos: 3.75 },
    };

    render(
      <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={() => {}} />
    );

    expect(screen.getByText(/audio/i)).toBeInTheDocument();
    expect(screen.getByText(/video/i)).toBeInTheDocument();
    expect(screen.getAllByText(/quality:/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('4.20/5')).toBeInTheDocument();
    expect(screen.getByText('3.75/5')).toBeInTheDocument();
  });

  it('Retry clears results and starts test', async () => {
    useNetworkTestMock.state.qualityResults = {
      audio: { mos: 4.2 },
      video: { mos: 3.75 },
    };
    useNetworkTestMock.testQuality.mockResolvedValue(undefined);

    render(
      <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={() => {}} />
    );

    await userEvent.click(screen.getByText(/retry test/i));

    await waitFor(() => {
      expect(useNetworkTestMock.clearResults).toHaveBeenCalled();
      expect(useNetworkTestMock.testQuality).toHaveBeenCalledWith('test-room');
    });
  });
});
