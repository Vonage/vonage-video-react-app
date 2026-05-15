import { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render as renderBase, screen, waitFor } from '@testing-library/react';
import RecordingPopUpIndicator from './RecordingPopupIndicator';
import { makeTestProvider, providers } from '@test/providers';
import { setupWindowNavigatorMock } from '@web-test/fixtures';
import jwt from 'jsonwebtoken';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

const translationsByKey: Record<string, string> = {
  'recording.consent.dialog.title': 'This meeting is being recorded',
  'recording.consent.dialog.content':
    'The host has started recording this meeting. Do you consent to being recorded?',
  'recording.consent.dialog.accept': 'I consent',
  'recording.consent.dialog.decline': 'I do not consent',
  'recording.consent.goodbye.header': 'Recording declined',
  'recording.consent.goodbye.message':
    'You chose not to consent to recording. Please rejoin when recording is stopped or ask the host to disable recording.',
};

vi.mock('react-i18next', () => {
  return {
    useTranslation: () => ({
      t: (key: string) => translationsByKey[key] ?? key,
    }),
  };
});

const sessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';
const sessionKey = jwt.sign({ sessionId, roomName: 'test-room-name' }, 'test', {
  algorithm: 'HS256',
});

describe('RecordingPopUpIndicator', () => {
  beforeEach(() => {
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve([]),
      },
      permissions: {
        query: Promise.resolve({ state: 'granted' } as PermissionStatus),
      },
    });
  });

  it('renders the consent dialog with translated text', () => {
    render(<RecordingPopUpIndicator shouldPromptRecordingConsent />);

    expect(screen.getByText(translationsByKey['recording.consent.dialog.title'])).toBeVisible();
    expect(screen.getByText(translationsByKey['recording.consent.dialog.content'])).toBeVisible();
    expect(screen.getByText(translationsByKey['recording.consent.dialog.accept'])).toBeVisible();
    expect(screen.getByText(translationsByKey['recording.consent.dialog.decline'])).toBeVisible();
  });

  it('redirects to /goodbye when the user declines consent', () => {
    render(<RecordingPopUpIndicator shouldPromptRecordingConsent />);

    fireEvent.click(screen.getByText(translationsByKey['recording.consent.dialog.decline']));

    expect(mockNavigate).toHaveBeenCalledWith(
      `/goodbye/${sessionKey}`,
      expect.objectContaining({
        state: {
          header: translationsByKey['recording.consent.goodbye.header'],
          caption: translationsByKey['recording.consent.goodbye.message'],
          isSelfDeclinedRecording: true,
        },
      })
    );
  });

  it('closes the dialog without redirect when the user consents', async () => {
    render(<RecordingPopUpIndicator shouldPromptRecordingConsent />);

    fireEvent.click(screen.getByTestId('popup-dialog-primary-button'));

    await waitFor(() => {
      expect(
        screen.queryByText(translationsByKey['recording.consent.dialog.title'])
      ).not.toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

function render(component: ReactElement) {
  const { wrapper, ...context } = makeTestProvider(
    [
      providers.user,
      providers.session,
      providers.publisher,
      providers.backgroundPublisher,
      providers.runtime,
    ],
    {
      sessionContext: {
        initialValue: {
          sessionKey,
        },
      },
      userContext: undefined,
      publisherContext: undefined,
      backgroundPublisherContext: undefined,
      runtimeContext: undefined,
    }
  );

  return {
    ...context,
    ...renderBase(component, {
      wrapper,
    }),
  };
}
