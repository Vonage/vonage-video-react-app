import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TestError, { TestErrorProps } from './TestError';
import { ErrorNames } from '../../../hooks/useNetworkTest';
import enTranslations from '../../../locales/en.json';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'precallTest.testError': enTranslations['precallTest.testError'],
        'precallTest.errors.mediaDevicesAccess':
          enTranslations['precallTest.errors.mediaDevicesAccess'],
        'precallTest.errors.noMicrophone': enTranslations['precallTest.errors.noMicrophone'],
        'precallTest.errors.noCamera': enTranslations['precallTest.errors.noCamera'],
        'precallTest.errors.unsupportedBrowser':
          enTranslations['precallTest.errors.unsupportedBrowser'],
        'precallTest.errors.networkConnection':
          enTranslations['precallTest.errors.networkConnection'],
        'precallTest.errors.unexpected': enTranslations['precallTest.errors.unexpected'],
      };
      return translations[key] || key;
    },
  }),
}));

describe('TestError', () => {
  const mockError: TestErrorProps['error'] = {
    name: 'TestError',
    message: 'Test error message',
  };

  it('renders correctly with basic error', () => {
    render(<TestError error={mockError} />);

    expect(screen.getByText(enTranslations['precallTest.testError'])).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  describe('error message mapping', () => {
    it('displays media devices access error message', () => {
      const error: TestErrorProps['error'] = {
        name: ErrorNames.FAILED_TO_OBTAIN_MEDIA_DEVICES,
        message: 'Original message',
      };

      render(<TestError error={error} />);

      expect(
        screen.getByText(enTranslations['precallTest.errors.mediaDevicesAccess'])
      ).toBeInTheDocument();
    });

    it('displays no microphone error message', () => {
      const error: TestErrorProps['error'] = {
        name: ErrorNames.NO_AUDIO_CAPTURE_DEVICES,
        message: 'Original message',
      };

      render(<TestError error={error} />);

      expect(
        screen.getByText(enTranslations['precallTest.errors.noMicrophone'])
      ).toBeInTheDocument();
    });

    it('displays no camera error message', () => {
      const error: TestErrorProps['error'] = {
        name: ErrorNames.NO_VIDEO_CAPTURE_DEVICES,
        message: 'Original message',
      };

      render(<TestError error={error} />);

      expect(screen.getByText(enTranslations['precallTest.errors.noCamera'])).toBeInTheDocument();
    });

    it('displays unsupported browser error message', () => {
      const error: TestErrorProps['error'] = {
        name: ErrorNames.UNSUPPORTED_BROWSER,
        message: 'Original message',
      };

      render(<TestError error={error} />);

      expect(
        screen.getByText(enTranslations['precallTest.errors.unsupportedBrowser'])
      ).toBeInTheDocument();
    });

    it('displays network connection error message', () => {
      const error: TestErrorProps['error'] = {
        name: ErrorNames.CONNECT_TO_SESSION_NETWORK_ERROR,
        message: 'Original message',
      };

      render(<TestError error={error} />);

      expect(
        screen.getByText(enTranslations['precallTest.errors.networkConnection'])
      ).toBeInTheDocument();
    });

    it('displays fallback message for unknown error with message', () => {
      const error: TestErrorProps['error'] = {
        name: 'UNKNOWN_ERROR',
        message: 'Custom error message',
      };

      render(<TestError error={error} />);

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('displays unexpected error message for unknown error without message', () => {
      const error: TestErrorProps['error'] = {
        name: 'UNKNOWN_ERROR',
        message: '',
      };

      render(<TestError error={error} />);

      expect(screen.getByText(enTranslations['precallTest.errors.unexpected'])).toBeInTheDocument();
    });

    it('displays unexpected error message for null message', () => {
      const error: TestErrorProps['error'] = {
        name: 'UNKNOWN_ERROR',
        message: '',
      };

      render(<TestError error={error} />);

      expect(screen.getByText(enTranslations['precallTest.errors.unexpected'])).toBeInTheDocument();
    });
  });
});
