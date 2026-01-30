import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach, afterAll, type Mock } from 'vitest';
import type { QualityResults } from './hooks/useNetworkTest';
import type CancelablePromise from 'easy-cancelable-promise/CancelablePromise';
import PrecallNetworkTestDialog from './PrecallNetworkTestDialog';

type NetworkTestState = {
  isTestingQuality: boolean;
  connectivityResults: unknown;
  qualityResults: QualityResults | null;
  error: { name: string; message: string } | null;
};

type NetworkTestHook = {
  state: NetworkTestState;
  testQuality: Mock<[roomName: string], CancelablePromise<QualityResults>>;
  stopTest: Mock;
  clearResults: Mock;
};

const mockRoomName = 'test-room';

vi.mock('@hooks/useRoomName', () => ({
  default: () => mockRoomName,
}));

const mockUseNetworkTest = vi.fn<[], NetworkTestHook>();

vi.mock('./hooks/useNetworkTest', () => ({
  default: () => mockUseNetworkTest(),
}));

function createNetworkTestHook(overrides?: Partial<NetworkTestState>): NetworkTestHook {
  return {
    state: {
      isTestingQuality: false,
      connectivityResults: null,
      qualityResults: null,
      error: null,
      ...overrides,
    },
    testQuality: vi.fn(() => ({
      onProgress: vi.fn().mockReturnThis(),
    })) as unknown as Mock<[roomName: string], CancelablePromise<QualityResults>>,
    stopTest: vi.fn(),
    clearResults: vi.fn(),
  };
}

describe('PrecallNetworkTestDialog', () => {
  let networkTestHook: NetworkTestHook;
  let unhandledRejectionHandler: ((reason: unknown) => void) | null = null;

  beforeEach(() => {
    // Ignore "Promise canceled" errors from CancelablePromise cleanup
    unhandledRejectionHandler = (reason: unknown) => {
      if (reason instanceof Error && reason.message === 'Promise canceled') {
        return;
      }
      throw reason;
    };
    process.on('unhandledRejection', unhandledRejectionHandler);

    networkTestHook = createNetworkTestHook();
    mockUseNetworkTest.mockReturnValue(networkTestHook);
  });

  afterAll(() => {
    if (unhandledRejectionHandler) {
      process.off('unhandledRejection', unhandledRejectionHandler);
    }
  });

  describe('Dialog visibility', () => {
    it('renders dialog when open', () => {
      render(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={vi.fn()} />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/pre-call network test/i)).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <PrecallNetworkTestDialog
          isPrecallNetworkTestOpen={false}
          setIsPrecallNetworkTestOpen={vi.fn()}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes dialog when close button is clicked', async () => {
      const setOpen = vi.fn();

      render(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={setOpen} />
      );

      const closeButton = screen.getByLabelText(/close/i);
      await userEvent.click(closeButton);

      expect(networkTestHook.stopTest).toHaveBeenCalled();
      expect(networkTestHook.clearResults).toHaveBeenCalled();
      expect(setOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('Testing state', () => {
    it('shows loading spinner when test is running', () => {
      networkTestHook = createNetworkTestHook({ isTestingQuality: true });
      mockUseNetworkTest.mockReturnValue(networkTestHook);

      render(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={vi.fn()} />
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText(/stop test/i)).toBeInTheDocument();
    });

    it('stops test when stop button is clicked', async () => {
      networkTestHook = createNetworkTestHook({ isTestingQuality: true });
      mockUseNetworkTest.mockReturnValue(networkTestHook);

      render(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={vi.fn()} />
      );

      await userEvent.click(screen.getByText(/stop test/i));

      expect(networkTestHook.stopTest).toHaveBeenCalled();
      expect(networkTestHook.clearResults).toHaveBeenCalled();
    });

    it('shows stopped state after user stops test', async () => {
      networkTestHook = createNetworkTestHook({ isTestingQuality: true });
      mockUseNetworkTest.mockReturnValue(networkTestHook);

      const { rerender } = render(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={vi.fn()} />
      );

      await userEvent.click(screen.getByText(/stop test/i));

      networkTestHook = createNetworkTestHook({ isTestingQuality: false });
      mockUseNetworkTest.mockReturnValue(networkTestHook);

      rerender(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={vi.fn()} />
      );

      expect(screen.getByText(/test stopped/i)).toBeInTheDocument();
      expect(screen.getByText(/retry test/i)).toBeInTheDocument();
    });
  });

  describe('Results state', () => {
    it('displays successful audio and video quality results', () => {
      networkTestHook = createNetworkTestHook({
        qualityResults: {
          audio: { mos: 4.2 },
          video: { mos: 3.75 },
        },
      });
      mockUseNetworkTest.mockReturnValue(networkTestHook);

      render(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={vi.fn()} />
      );

      expect(screen.getByText(/audio/i)).toBeInTheDocument();
      expect(screen.getByText(/video/i)).toBeInTheDocument();
      expect(screen.getByText('4.20/5')).toBeInTheDocument();
      expect(screen.getByText('3.75/5')).toBeInTheDocument();
      expect(screen.getByTitle(/audio is supported/i)).toBeInTheDocument();
      expect(screen.getByTitle(/video is supported/i)).toBeInTheDocument();
    });

    it('displays poor quality indicators for low scores', () => {
      networkTestHook = createNetworkTestHook({
        qualityResults: {
          audio: { mos: 2.5 },
          video: { mos: 1.8 },
        },
      });
      mockUseNetworkTest.mockReturnValue(networkTestHook);

      render(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={vi.fn()} />
      );

      expect(screen.getByText('2.50/5')).toBeInTheDocument();
      expect(screen.getByText('1.80/5')).toBeInTheDocument();
      expect(screen.getByTitle(/audio is not supported/i)).toBeInTheDocument();
      expect(screen.getByTitle(/video is not supported/i)).toBeInTheDocument();
    });

    it('displays error state when test fails', () => {
      networkTestHook = createNetworkTestHook({
        error: {
          name: 'NetworkError',
          message: 'Connection failed',
        },
      });
      mockUseNetworkTest.mockReturnValue(networkTestHook);

      render(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={vi.fn()} />
      );

      expect(screen.getByText(/test failed/i)).toBeInTheDocument();
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
      expect(screen.getByText(/retry test/i)).toBeInTheDocument();
    });
  });

  describe('Retry functionality', () => {
    it('clears results and starts new test when retry is clicked', async () => {
      networkTestHook = createNetworkTestHook({
        qualityResults: {
          audio: { mos: 4.2 },
          video: { mos: 3.75 },
        },
      });
      mockUseNetworkTest.mockReturnValue(networkTestHook);

      render(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={vi.fn()} />
      );

      await userEvent.click(screen.getByText(/retry test/i));

      expect(networkTestHook.clearResults).toHaveBeenCalled();
      expect(networkTestHook.testQuality).toHaveBeenCalledWith(mockRoomName);
    });

    it('retries test from stopped state', async () => {
      networkTestHook = createNetworkTestHook({ isTestingQuality: true });
      mockUseNetworkTest.mockReturnValue(networkTestHook);

      const { rerender } = render(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={vi.fn()} />
      );

      await userEvent.click(screen.getByText(/stop test/i));

      networkTestHook = createNetworkTestHook({ isTestingQuality: false });
      mockUseNetworkTest.mockReturnValue(networkTestHook);

      rerender(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={vi.fn()} />
      );

      await userEvent.click(screen.getByText(/retry test/i));

      expect(networkTestHook.clearResults).toHaveBeenCalled();
      expect(networkTestHook.testQuality).toHaveBeenCalledWith(mockRoomName);
    });

    it('retries test from error state', async () => {
      networkTestHook = createNetworkTestHook({
        error: { name: 'NetworkError', message: 'Failed' },
      });
      mockUseNetworkTest.mockReturnValue(networkTestHook);

      render(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={vi.fn()} />
      );

      await userEvent.click(screen.getByText(/retry test/i));

      expect(networkTestHook.clearResults).toHaveBeenCalled();
      expect(networkTestHook.testQuality).toHaveBeenCalledWith(mockRoomName);
    });
  });

  describe('Auto-start behavior', () => {
    it('automatically starts test when dialog opens', () => {
      const { rerender } = render(
        <PrecallNetworkTestDialog
          isPrecallNetworkTestOpen={false}
          setIsPrecallNetworkTestOpen={vi.fn()}
        />
      );

      expect(networkTestHook.testQuality).not.toHaveBeenCalled();

      rerender(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={vi.fn()} />
      );

      expect(networkTestHook.testQuality).toHaveBeenCalledWith(mockRoomName);
    });

    it('does not auto-start if test is already running', () => {
      networkTestHook = createNetworkTestHook({ isTestingQuality: true });
      mockUseNetworkTest.mockReturnValue(networkTestHook);

      render(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={vi.fn()} />
      );

      expect(networkTestHook.testQuality).not.toHaveBeenCalled();
    });

    it('does not auto-start if results already exist', () => {
      networkTestHook = createNetworkTestHook({
        qualityResults: {
          audio: { mos: 4.2 },
          video: { mos: 3.75 },
        },
      });
      mockUseNetworkTest.mockReturnValue(networkTestHook);

      render(
        <PrecallNetworkTestDialog isPrecallNetworkTestOpen setIsPrecallNetworkTestOpen={vi.fn()} />
      );

      expect(networkTestHook.testQuality).not.toHaveBeenCalled();
    });
  });
});
