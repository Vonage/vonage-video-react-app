import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PreCallTest from './PreCallTest';
import enTranslations from '../../locales/en.json';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock react-i18next
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
vi.mock('../../hooks/useRoomName', () => ({
  default: () => mockRoomName,
}));

// Mock useNetworkTest hook
const mockNetworkTestState = {
  error: null,
  connectivityResults: null,
  qualityResults: null,
  qualityStats: null,
  isTestingConnectivity: false,
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

vi.mock('../../components/Banner', () => ({
  default: () => <div data-testid="banner">Banner</div>,
}));

vi.mock('../../components/PreCall/TestError', () => ({
  default: ({ error }: { error: { name: string; message: string } }) => (
    <div data-testid="test-error">{error.message}</div>
  ),
}));

vi.mock('../../components/PreCall/ConnectivityResults', () => ({
  default: () => <div data-testid="connectivity-results">Connectivity Results</div>,
}));

vi.mock('../../components/PreCall/QualityResults', () => ({
  default: () => <div data-testid="quality-results">Quality Results</div>,
}));

vi.mock('../../components/PreCall/TestProgress', () => ({
  default: () => <div data-testid="test-progress">Test Progress</div>,
}));

vi.mock('../../components/PreCall/TestControls', () => ({
  default: ({
    onStartConnectivityTest,
    onStartQualityTest,
    onStopTest,
    onClearResults,
    onContinueToCall,
    roomName,
    isTestingStarted,
    isTestingConnectivity,
    isTestingQuality,
    hasResults,
  }: {
    onStartConnectivityTest: () => void;
    onStartQualityTest: () => void;
    onStopTest: () => void;
    onClearResults: () => void;
    onContinueToCall: () => void;
    roomName: string | null;
    isTestingStarted: boolean;
    isTestingConnectivity: boolean;
    isTestingQuality: boolean;
    hasResults: boolean;
  }) => (
    <div data-testid="test-controls">
      <button type="button" onClick={onStartConnectivityTest} data-testid="start-connectivity">
        Start Connectivity Test
      </button>
      <button type="button" onClick={onStartQualityTest} data-testid="start-quality">
        Start Quality Test
      </button>
      <button type="button" onClick={onStopTest} data-testid="stop-test">
        Stop Test
      </button>
      <button type="button" onClick={onClearResults} data-testid="clear-results">
        Clear Results
      </button>
      <button type="button" onClick={onContinueToCall} data-testid="continue-to-waiting-room">
        Continue to Waiting Room
      </button>
      <div data-testid="control-props">
        {JSON.stringify({
          roomName,
          isTestingStarted,
          isTestingConnectivity,
          isTestingQuality,
          hasResults,
        })}
      </div>
    </div>
  ),
}));

const renderPreCallTest = () => {
  return render(
    <MemoryRouter>
      <PreCallTest />
    </MemoryRouter>
  );
};

describe('PreCallTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.assign(mockNetworkTestState, {
      error: null,
      connectivityResults: null,
      qualityResults: null,
      qualityStats: null,
      isTestingConnectivity: false,
      isTestingQuality: false,
    });
  });

  it('renders the page layout correctly', () => {
    renderPreCallTest();

    expect(screen.getByTestId('banner')).toBeInTheDocument();
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

  it('displays connectivity results when available', () => {
    const mockConnectivityResults = { success: true };
    Object.assign(mockNetworkTestState, { connectivityResults: mockConnectivityResults });

    renderPreCallTest();

    expect(screen.getByTestId('connectivity-results')).toBeInTheDocument();
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
      isTestingConnectivity: true,
    });

    renderPreCallTest();

    expect(screen.getByTestId('test-progress')).toBeInTheDocument();
  });

  it('handles connectivity test start correctly', async () => {
    mockTestConnectivity.mockResolvedValue(undefined);

    renderPreCallTest();

    const startButton = screen.getByTestId('start-connectivity');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockTestConnectivity).toHaveBeenCalledWith(mockRoomName);
    });
  });

  it('handles quality test start correctly', async () => {
    mockTestQuality.mockResolvedValue(undefined);

    renderPreCallTest();

    const startButton = screen.getByTestId('start-quality');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockTestQuality).toHaveBeenCalledWith(mockRoomName, { timeout: 15000 });
    });
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

    expect(mockNavigate).toHaveBeenCalledWith(`/waiting-room/${mockRoomName}`);
  });

  it('passes correct props to TestControls component', () => {
    const mockConnectivityResults = { success: true };
    Object.assign(mockNetworkTestState, {
      connectivityResults: mockConnectivityResults,
      isTestingConnectivity: true,
    });

    renderPreCallTest();

    const controlProps = screen.getByTestId('control-props');
    const props = JSON.parse(controlProps.textContent || '{}');

    expect(props.roomName).toBe(mockRoomName);
    expect(props.isTestingStarted).toBe(false);
    expect(props.isTestingConnectivity).toBe(true);
    expect(props.isTestingQuality).toBe(false);
    expect(props.hasResults).toBe(true);
  });

  it('handles connectivity test error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Network error');
    mockTestConnectivity.mockRejectedValue(mockError);

    renderPreCallTest();

    const startButton = screen.getByTestId('start-connectivity');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Connectivity test failed:', mockError);
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles quality test error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Quality test error');
    mockTestQuality.mockRejectedValue(mockError);

    renderPreCallTest();

    const startButton = screen.getByTestId('start-quality');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Quality test failed:', mockError);
    });

    consoleErrorSpy.mockRestore();
  });

  it('passes roomName correctly to TestControls', () => {
    renderPreCallTest();

    const controlProps = screen.getByTestId('control-props');
    const props = JSON.parse(controlProps.textContent || '{}');

    expect(props.roomName).toBe(mockRoomName);
  });

  it('hides description when test is started', async () => {
    renderPreCallTest();
    expect(screen.getByText(enTranslations['precallTest.description'])).toBeInTheDocument();

    const startButton = screen.getByTestId('start-connectivity');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.queryByText(enTranslations['precallTest.description'])).not.toBeInTheDocument();
    });
  });

  it('hides description when there is an error', () => {
    const mockError = { name: 'TestError', message: 'Test failed' };
    Object.assign(mockNetworkTestState, { error: mockError });

    renderPreCallTest();

    expect(screen.queryByText(enTranslations['precallTest.description'])).not.toBeInTheDocument();
  });
});
