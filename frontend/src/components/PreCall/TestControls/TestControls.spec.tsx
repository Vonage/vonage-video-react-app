import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TestControls, { TestControlsProps } from './TestControls';
import enTranslations from '../../../locales/en.json';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'precallTest.stopTest': enTranslations['precallTest.stopTest'],
        'precallTest.retryTest': enTranslations['precallTest.retryTest'],
        'precallTest.continueToWaitingRoom': enTranslations['precallTest.continueToWaitingRoom'],
      };
      return translations[key] || key;
    },
  }),
}));

describe('TestControls', () => {
  const mockCallbacks = {
    onStopTest: vi.fn(),
    onRetryTest: vi.fn(),
    onContinueToWaitingRoom: vi.fn(),
  };

  const defaultProps: TestControlsProps = {
    isTestingQuality: false,
    hasResults: false,
    ...mockCallbacks,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no tests are running and no results', () => {
    render(<TestControls {...defaultProps} />);

    expect(screen.queryByText(enTranslations['precallTest.stopTest'])).not.toBeInTheDocument();
    expect(screen.queryByText(enTranslations['precallTest.retryTest'])).not.toBeInTheDocument();
    expect(
      screen.queryByText(enTranslations['precallTest.continueToWaitingRoom'])
    ).not.toBeInTheDocument();
  });

  it('shows stop button when quality test is running', () => {
    const props: TestControlsProps = {
      ...defaultProps,
      isTestingQuality: true,
    };

    render(<TestControls {...props} />);

    expect(screen.getByText(enTranslations['precallTest.stopTest'])).toBeInTheDocument();

    expect(screen.queryByText(enTranslations['precallTest.retryTest'])).not.toBeInTheDocument();
    expect(
      screen.queryByText(enTranslations['precallTest.continueToWaitingRoom'])
    ).not.toBeInTheDocument();
  });

  it('shows results buttons when tests have completed', () => {
    const props: TestControlsProps = {
      ...defaultProps,
      hasResults: true,
    };

    render(<TestControls {...props} />);

    expect(screen.getByText(enTranslations['precallTest.retryTest'])).toBeInTheDocument();
    expect(
      screen.getByText(enTranslations['precallTest.continueToWaitingRoom'])
    ).toBeInTheDocument();

    expect(screen.queryByText(enTranslations['precallTest.stopTest'])).not.toBeInTheDocument();
  });

  it('calls appropriate callbacks when buttons are clicked', () => {
    const runningProps: TestControlsProps = {
      ...defaultProps,
      isTestingQuality: true,
    };
    const { rerender } = render(<TestControls {...runningProps} />);

    fireEvent.click(screen.getByText(enTranslations['precallTest.stopTest']));
    expect(mockCallbacks.onStopTest).toHaveBeenCalledTimes(1);

    const resultsProps: TestControlsProps = {
      ...defaultProps,
      hasResults: true,
    };
    rerender(<TestControls {...resultsProps} />);

    fireEvent.click(screen.getByText(enTranslations['precallTest.retryTest']));
    expect(mockCallbacks.onRetryTest).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(enTranslations['precallTest.continueToWaitingRoom']));
    expect(mockCallbacks.onContinueToWaitingRoom).toHaveBeenCalledTimes(1);
  });
});
