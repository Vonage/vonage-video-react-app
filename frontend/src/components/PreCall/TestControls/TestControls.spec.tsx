import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TestControls, { TestControlsProps } from './TestControls';
import enTranslations from '../../../locales/en.json';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'precallTest.testConnectivity': enTranslations['precallTest.testConnectivity'],
        'precallTest.testQuality': enTranslations['precallTest.testQuality'],
        'precallTest.skipTest': enTranslations['precallTest.skipTest'],
        'precallTest.stopTest': enTranslations['precallTest.stopTest'],
        'precallTest.clearResults': enTranslations['precallTest.clearResults'],
        'precallTest.continueToCall': enTranslations['precallTest.continueToCall'],
      };
      return translations[key] || key;
    },
  }),
}));

describe('TestControls', () => {
  const mockCallbacks = {
    onStartConnectivityTest: vi.fn(),
    onStartQualityTest: vi.fn(),
    onStopTest: vi.fn(),
    onClearResults: vi.fn(),
    onContinueToCall: vi.fn(),
  };

  const defaultProps: TestControlsProps = {
    roomName: 'test-room',
    isTestingStarted: false,
    isTestingConnectivity: false,
    isTestingQuality: false,
    hasResults: false,
    ...mockCallbacks,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial test buttons when no tests are running and no results', () => {
    render(<TestControls {...defaultProps} />);

    expect(screen.getByText(enTranslations['precallTest.testConnectivity'])).toBeInTheDocument();
    expect(screen.getByText(enTranslations['precallTest.testQuality'])).toBeInTheDocument();
    expect(screen.getByText(enTranslations['precallTest.skipTest'])).toBeInTheDocument();

    expect(screen.queryByText(enTranslations['precallTest.stopTest'])).not.toBeInTheDocument();
    expect(screen.queryByText(enTranslations['precallTest.clearResults'])).not.toBeInTheDocument();
    expect(
      screen.queryByText(enTranslations['precallTest.continueToCall'])
    ).not.toBeInTheDocument();
  });

  it('shows stop button when tests are running', () => {
    const props: TestControlsProps = {
      ...defaultProps,
      isTestingConnectivity: true,
    };

    render(<TestControls {...props} />);

    expect(screen.getByText(enTranslations['precallTest.stopTest'])).toBeInTheDocument();

    // Should not show initial test buttons
    expect(
      screen.queryByText(enTranslations['precallTest.testConnectivity'])
    ).not.toBeInTheDocument();
    expect(screen.queryByText(enTranslations['precallTest.testQuality'])).not.toBeInTheDocument();
    expect(screen.queryByText(enTranslations['precallTest.skipTest'])).not.toBeInTheDocument();
  });

  it('shows results buttons when tests have completed', () => {
    const props: TestControlsProps = {
      ...defaultProps,
      hasResults: true,
    };

    render(<TestControls {...props} />);

    expect(screen.getByText(enTranslations['precallTest.clearResults'])).toBeInTheDocument();
    expect(screen.getByText(enTranslations['precallTest.continueToCall'])).toBeInTheDocument();

    // Should not show initial test buttons or stop button
    expect(
      screen.queryByText(enTranslations['precallTest.testConnectivity'])
    ).not.toBeInTheDocument();
    expect(screen.queryByText(enTranslations['precallTest.skipTest'])).not.toBeInTheDocument();
    expect(screen.queryByText(enTranslations['precallTest.stopTest'])).not.toBeInTheDocument();
  });

  it('calls appropriate callbacks when buttons are clicked', () => {
    render(<TestControls {...defaultProps} />);

    fireEvent.click(screen.getByText(enTranslations['precallTest.testConnectivity']));
    expect(mockCallbacks.onStartConnectivityTest).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(enTranslations['precallTest.testQuality']));
    expect(mockCallbacks.onStartQualityTest).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(enTranslations['precallTest.skipTest']));
    expect(mockCallbacks.onContinueToCall).toHaveBeenCalledTimes(1);
  });
});
