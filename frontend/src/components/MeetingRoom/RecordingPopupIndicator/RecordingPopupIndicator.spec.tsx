import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import useRoomName from '@hooks/useRoomName';
import RecordingPopUpIndicator from './RecordingPopupIndicator';

vi.mock('@hooks/useRoomName');

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

describe('RecordingPopUpIndicator', () => {
  const mockedRoomName = 'test-room-name';
  const mockUseRoomName = useRoomName as Mock<[], string>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRoomName.mockReturnValue(mockedRoomName);
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
      '/goodbye',
      expect.objectContaining({
        state: {
          header: translationsByKey['recording.consent.goodbye.header'],
          caption: translationsByKey['recording.consent.goodbye.message'],
          roomName: mockedRoomName,
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
