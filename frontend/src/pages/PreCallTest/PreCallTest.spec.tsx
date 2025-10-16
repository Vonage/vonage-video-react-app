import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import PreCallTest from './PreCallTest';
import enTranslations from '../../locales/en.json';
import useRoomName from '../../hooks/useRoomName';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'precallTest.title': enTranslations['precallTest.title'],
        'precallTest.subtitle': enTranslations['precallTest.subtitle'],
        'precallTest.loading': enTranslations['precallTest.loading'],
        'precallTest.description': enTranslations['precallTest.description'],
      };
      return translations[key] || key;
    },
  }),
}));

const mockRoomName = 'test-room';
vi.mock('../../hooks/useRoomName');
const mockOnModalClose = vi.fn();

const mockNetworkTestState = {
  error: null,
  connectivityResults: null,
  qualityResults: null,
  qualityStats: null,
  isTestingQuality: false,
};

const mockTestConnectivity = vi.fn();
const mockTestQuality = vi.fn();
const mockStopTest = vi.fn();
const mockClearResults = vi.fn();

vi.mock('../../hooks/useNetworkTest', () => ({
  default: () => ({
    state: mockNetworkTestState,
    testConnectivity: mockTestConnectivity,
    testQuality: mockTestQuality,
    stopTest: mockStopTest,
    clearResults: mockClearResults,
  }),
}));

vi.mock('../../components/PreCall/TestError', () => ({
  default: ({ error }: { error: { name: string; message: string } }) => (
    <div data-testid="test-error">{error.message}</div>
  ),
}));

vi.mock('../../components/PreCall/QualityResults', () => ({
  default: () => <div data-testid="quality-results">Quality Results</div>,
}));

vi.mock('../../components/PreCall/TestProgress', () => ({
  default: () => <div data-testid="test-progress">Test Progress</div>,
}));

vi.mock('../../components/PreCall/TestControls', () => ({
  default: ({
    onStopTest,
    onClearResults,
    onContinueToWaitingRoom,
    isTestingQuality,
    hasResults,
  }: {
    onStopTest: () => void;
    onClearResults: () => void;
    onContinueToWaitingRoom: () => void;
    isTestingQuality: boolean;
    hasResults: boolean;
  }) => (
    <div data-testid="test-controls">
      <button type="button" onClick={onStopTest} data-testid="stop-test">
        Stop Test
      </button>
      <button type="button" onClick={onClearResults} data-testid="clear-results">
        Clear Results
      </button>
      <button
        type="button"
        onClick={onContinueToWaitingRoom}
        data-testid="continue-to-waiting-room"
      >
        Continue to Waiting Room
      </button>
      <div data-testid="control-props">
        {JSON.stringify({
          isTestingQuality,
          hasResults,
        })}
      </div>
    </div>
  ),
}));

const renderPreCallTest = () => {
  return render(<PreCallTest onModalClose={mockOnModalClose} />);
};

describe('PreCallTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRoomName as Mock).mockReturnValue(mockRoomName);
    mockOnModalClose.mockClear();

    Object.assign(mockNetworkTestState, {
      error: null,
      connectivityResults: null,
      qualityResults: null,
      qualityStats: null,
      isTestingQuality: false,
    });
  });

  it('renders the page layout correctly', () => {
    renderPreCallTest();

    expect(screen.getByText(enTranslations['precallTest.title'])).toBeInTheDocument();
    expect(screen.getByText(enTranslations['precallTest.subtitle'])).toBeInTheDocument();
    expect(screen.getByText(mockRoomName)).toBeInTheDocument();
    expect(screen.getByTestId('test-controls')).toBeInTheDocument();
  });

  it('displays room name in subtitle', () => {
    renderPreCallTest();

    expect(screen.getByText(mockRoomName)).toBeInTheDocument();
    expect(screen.getByText(enTranslations['precallTest.subtitle'])).toBeInTheDocument();
  });

  it('shows description text when no test is started and no error', () => {
    renderPreCallTest();

    expect(screen.getByText(enTranslations['precallTest.description'])).toBeInTheDocument();
  });

  it('displays error component when there is an error', () => {
    const mockError = { name: 'TestError', message: 'Test failed' };
    Object.assign(mockNetworkTestState, { error: mockError });

    renderPreCallTest();

    expect(screen.getByTestId('test-error')).toBeInTheDocument();
    expect(screen.getByText('Test failed')).toBeInTheDocument();
  });

  it('displays quality results when available', () => {
    const mockQualityResults = { video: { supported: true } };
    Object.assign(mockNetworkTestState, { qualityResults: mockQualityResults });

    renderPreCallTest();

    expect(screen.getByTestId('quality-results')).toBeInTheDocument();
  });

  it('displays test progress when testing is in progress', () => {
    Object.assign(mockNetworkTestState, {
      qualityStats: { video: { bitrate: 100 } },
      isTestingQuality: true,
    });

    renderPreCallTest();

    expect(screen.getByTestId('test-progress')).toBeInTheDocument();
  });

  it('handles stop test correctly', () => {
    renderPreCallTest();

    const stopButton = screen.getByTestId('stop-test');
    fireEvent.click(stopButton);

    expect(mockStopTest).toHaveBeenCalled();
  });

  it('handles clear results correctly', () => {
    renderPreCallTest();

    const clearButton = screen.getByTestId('clear-results');
    fireEvent.click(clearButton);

    expect(mockClearResults).toHaveBeenCalled();
  });

  it('handles continue to waiting room correctly', () => {
    renderPreCallTest();

    const continueButton = screen.getByTestId('continue-to-waiting-room');
    fireEvent.click(continueButton);

    expect(mockOnModalClose).toHaveBeenCalled();
  });

  it('passes correct props to TestControls component', () => {
    const mockQualityResults = { video: { supported: true } };
    Object.assign(mockNetworkTestState, {
      qualityResults: mockQualityResults,
      isTestingQuality: true,
    });

    renderPreCallTest();

    const controlProps = screen.getByTestId('control-props');
    const props = JSON.parse(controlProps.textContent || '{}');

    expect(props.isTestingQuality).toBe(true);
    expect(props.hasResults).toBe(true);
  });
});

it('shows description when test has not started', () => {
  Object.assign(mockNetworkTestState, { qualityResults: { video: { supported: true } } });

  renderPreCallTest();

  expect(screen.getByText(enTranslations['precallTest.description'])).toBeInTheDocument();
});

it('hides description when there is an error', () => {
  const mockError = { name: 'TestError', message: 'Test failed' };
  Object.assign(mockNetworkTestState, { error: mockError });

  renderPreCallTest();

  expect(screen.queryByText(enTranslations['precallTest.description'])).not.toBeInTheDocument();
});
