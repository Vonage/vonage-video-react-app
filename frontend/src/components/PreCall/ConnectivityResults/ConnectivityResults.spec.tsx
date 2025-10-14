import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ConnectivityResults from './ConnectivityResults';
import { ConnectivityResults as ConnectivityResultsType } from '../../../hooks/useNetworkTest';
import enTranslations from '../../../locales/en.json';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'precallTest.connectivityResults': enTranslations['precallTest.connectivityResults'],
        'precallTest.status': enTranslations['precallTest.status'],
        'precallTest.success': enTranslations['precallTest.success'],
        'precallTest.failed': enTranslations['precallTest.failed'],
        'precallTest.issues': enTranslations['precallTest.issues'],
      };
      return translations[key] || key;
    },
  }),
}));

describe('ConnectivityResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the connectivity results title', () => {
    const mockResults: ConnectivityResultsType = {
      success: true,
    };

    render(<ConnectivityResults results={mockResults} />);

    expect(screen.getByText(enTranslations['precallTest.connectivityResults'])).toBeInTheDocument();
  });

  it('displays success status when connectivity test passes', () => {
    const mockResults: ConnectivityResultsType = {
      success: true,
    };

    render(<ConnectivityResults results={mockResults} />);

    expect(
      screen.getByText((content) => content.includes(enTranslations['precallTest.status']))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes(enTranslations['precallTest.success']))
    ).toBeInTheDocument();
  });

  it('displays failed status when connectivity test fails', () => {
    const mockResults: ConnectivityResultsType = {
      success: false,
    };

    render(<ConnectivityResults results={mockResults} />);

    expect(
      screen.getByText((content) => content.includes(enTranslations['precallTest.status']))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes(enTranslations['precallTest.failed']))
    ).toBeInTheDocument();
  });

  it('displays failed tests when failedTests array is provided', () => {
    const mockResults: ConnectivityResultsType = {
      success: false,
      failedTests: [
        {
          type: 'ConnectToSession',
          error: {
            message: 'Failed to connect to session',
            name: 'CONNECTION_ERROR',
          },
        },
        {
          type: 'PublishToSession',
          error: {
            message: 'Failed to publish stream',
            name: 'PUBLISH_ERROR',
          },
        },
      ],
    };

    render(<ConnectivityResults results={mockResults} />);

    expect(
      screen.getByText((content) => content.includes(enTranslations['precallTest.issues']))
    ).toBeInTheDocument();
    expect(screen.getByText('ConnectToSession: Failed to connect to session')).toBeInTheDocument();
    expect(screen.getByText('PublishToSession: Failed to publish stream')).toBeInTheDocument();
  });

  it('does not display issues section when test is successful', () => {
    const mockResults: ConnectivityResultsType = {
      success: true,
    };

    render(<ConnectivityResults results={mockResults} />);

    expect(screen.queryByText(enTranslations['precallTest.issues'])).not.toBeInTheDocument();
  });

  it('does not display issues section when failedTests array is empty', () => {
    const mockResults: ConnectivityResultsType = {
      success: false,
      failedTests: [],
    };

    render(<ConnectivityResults results={mockResults} />);

    expect(screen.queryByText(enTranslations['precallTest.issues'])).not.toBeInTheDocument();
  });

  it('handles single failed test correctly', () => {
    const mockResults: ConnectivityResultsType = {
      success: false,
      failedTests: [
        {
          type: 'MediaAccess',
          error: {
            message: 'Camera access denied',
            name: 'MEDIA_ACCESS_DENIED',
          },
        },
      ],
    };

    render(<ConnectivityResults results={mockResults} />);

    expect(
      screen.getByText((content) => content.includes(enTranslations['precallTest.issues']))
    ).toBeInTheDocument();
    expect(screen.getByText('MediaAccess: Camera access denied')).toBeInTheDocument();
  });

  it('handles multiple failed tests with different error types', () => {
    const mockResults: ConnectivityResultsType = {
      success: false,
      failedTests: [
        {
          type: 'NetworkLatency',
          error: {
            message: 'High network latency detected',
            name: 'LATENCY_ERROR',
          },
        },
        {
          type: 'Bandwidth',
          error: {
            message: 'Insufficient bandwidth',
            name: 'BANDWIDTH_ERROR',
          },
        },
        {
          type: 'FirewallBlocking',
          error: {
            message: 'Firewall blocking connection',
            name: 'FIREWALL_ERROR',
          },
        },
      ],
    };

    render(<ConnectivityResults results={mockResults} />);

    expect(
      screen.getByText((content) => content.includes(enTranslations['precallTest.issues']))
    ).toBeInTheDocument();
    expect(screen.getByText('NetworkLatency: High network latency detected')).toBeInTheDocument();
    expect(screen.getByText('Bandwidth: Insufficient bandwidth')).toBeInTheDocument();
    expect(screen.getByText('FirewallBlocking: Firewall blocking connection')).toBeInTheDocument();
  });

  it('renders failed status with issues when both conditions are met', () => {
    const mockResults: ConnectivityResultsType = {
      success: false,
      failedTests: [
        {
          type: 'TestType',
          error: {
            message: 'Test error message',
            name: 'TEST_ERROR',
          },
        },
      ],
    };

    render(<ConnectivityResults results={mockResults} />);

    expect(
      screen.getByText((content) => content.includes(enTranslations['precallTest.issues']))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes(enTranslations['precallTest.failed']))
    ).toBeInTheDocument();
    expect(screen.getByText('TestType: Test error message')).toBeInTheDocument();
  });
});
