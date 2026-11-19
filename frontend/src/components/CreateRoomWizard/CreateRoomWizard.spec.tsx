import { testIds as wizardDialogTestIds } from './components/CreateRoomWizardDialog/testIds';
import { testIds as scheduleFieldsTestIds } from './components/DetailsStep/components/scheduleFieldsTestIds';
import { testIds as detailsStepTestIds } from './components/DetailsStep/testIds';
import { testIds as meetingNameFieldTestIds } from './components/DetailsStep/components/meetingNameFieldTestIds';
import { testIds as createMeetingButtonTestIds } from './components/CreateMeetingButton/testIds';
import { act, fireEvent, render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeTestProvider, providers } from '@test/providers';
import { makeVideoClientMock } from '@core-test/fixtures';
import { VALID_SESSION_ID } from '@web-test/fixtures';
import { decodeSessionId } from '@common/helpers';
import { assertNotNil, isValidRoomName } from '@common/assertions';
import { notifications$ } from '@core/stores';
import CreateRoomWizard from './index';
import { testIds as footerTestIds } from './components/CreateRoomWizardFooterActions/CreateRoomWizardFooterActions';
import { testIds as linkCopyTestIds } from './components/ShareStep/components/LinkCopyField/LinkCopyField';

describe('CreateRoomWizard', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates an unscheduled meeting, shows its link, copies it, and closes on Done', async () => {
    expect.assertions(8);
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    const onClose = vi.fn();

    const { videoClient } = renderWizard({ onClose });

    expect(screen.getByRole('note')).toHaveTextContent('the link never expires');
    await user.click(screen.getByTestId(createMeetingButtonTestIds.button));
    const [payload] = vi.mocked(videoClient.createSession).mock.calls[0];
    assertNotNil(payload?.roomName);
    expect(isValidRoomName(payload.roomName)).toBe(true);
    vi.useFakeTimers();

    const meetingLink = `${window.location.origin}/waiting-room/test-session-key`;
    expect(screen.getByTestId(linkCopyTestIds.link)).toHaveTextContent(meetingLink);

    await act(async () => {
      fireEvent.click(screen.getByTestId(linkCopyTestIds.copyButton));
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(writeText).toHaveBeenCalledWith(meetingLink);
    expect(screen.getByTestId(linkCopyTestIds.copyButton)).toHaveAccessibleName('Link copied');

    await act(() => vi.advanceTimersByTimeAsync(2000));
    await act(async () => {
      fireEvent.click(screen.getByTestId(linkCopyTestIds.copyButton));
      await vi.advanceTimersByTimeAsync(0);
    });
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(screen.getByTestId(linkCopyTestIds.copyButton)).toHaveAccessibleName('Link copied');

    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(screen.getByTestId(linkCopyTestIds.copyButton)).toHaveAccessibleName('Copy link');

    fireEvent.click(screen.getByTestId(footerTestIds.doneButton));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not say the link is copied when the clipboard write fails', async () => {
    expect.assertions(2);
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValue(new Error('denied'));
    renderWizard({ onClose: vi.fn() });

    await user.click(screen.getByTestId(createMeetingButtonTestIds.button));
    await user.click(await screen.findByTestId(linkCopyTestIds.copyButton));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId(linkCopyTestIds.copyButton)).toHaveAccessibleName('Copy link');
  });

  it('validates the name and start before creating a scheduled meeting with the chosen duration', async () => {
    expect.assertions(10);
    const user = userEvent.setup();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2030, 0, 15, 9, 20));
    const { videoClient } = renderWizard({ onClose: vi.fn() });
    const nameInput = screen.getByTestId(meetingNameFieldTestIds.input);
    const createButton = screen.getByTestId(createMeetingButtonTestIds.button);

    await user.type(nameInput, 'Weekly Sync');
    expect(nameInput).toHaveValue('weekly sync');
    expect(createButton).toBeDisabled();

    await user.clear(nameInput);
    await user.type(nameInput, 'Weekly-Sync');
    await user.click(screen.getByTestId(detailsStepTestIds.scheduleSwitch));

    fireEvent.change(screen.getByTestId(scheduleFieldsTestIds.startTime), {
      target: { value: '09:00' },
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Choose a start time that is not in the past.'
    );
    expect(createButton).toBeDisabled();

    fireEvent.change(screen.getByTestId(scheduleFieldsTestIds.startTime), {
      target: { value: '10:00' },
    });
    vi.setSystemTime(new Date(2030, 0, 15, 10, 5));
    await user.click(createButton);
    expect(videoClient.createSession).not.toHaveBeenCalled();
    expect([...notifications$.getState().notifications.values()]).toEqual([
      expect.objectContaining({
        type: 'warning',
        message: 'Choose a start time that is not in the past.',
      }),
    ]);

    fireEvent.change(screen.getByTestId(scheduleFieldsTestIds.startTime), {
      target: { value: '11:00' },
    });

    expect(screen.getByTestId(scheduleFieldsTestIds.duration(60))).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await user.click(screen.getByTestId(scheduleFieldsTestIds.duration(120)));
    await user.click(createButton);

    expect(videoClient.createSession).toHaveBeenCalledWith({
      roomName: 'weekly-sync',
      schedule: { startsAt: new Date(2030, 0, 15, 11, 0).getTime(), durationMinutes: 120 },
    });
    expect(screen.getByTestId(wizardDialogTestIds.dialog)).toHaveTextContent('weekly-sync');
    expect(screen.getByTestId(wizardDialogTestIds.dialog)).toHaveTextContent('2 hours');
  });

  it('opens the waiting room of the new meeting on Join now', async () => {
    expect.assertions(1);
    const user = userEvent.setup();
    renderWizard({ onClose: vi.fn() });

    await user.click(screen.getByTestId(createMeetingButtonTestIds.button));
    await user.click(await screen.findByTestId(footerTestIds.joinButton));

    expect(screen.getByRole('status')).toHaveTextContent('waiting room test-session-key');
  });
});

function renderWizard({ onClose }: { onClose: () => void }) {
  const videoClient = makeVideoClientMock({
    createSession: Promise.resolve({
      ...decodeSessionId({ sessionId: VALID_SESSION_ID }),
      sessionId: VALID_SESSION_ID,
      sessionKey: 'test-session-key',
    }),
  });
  const { wrapper } = makeTestProvider([providers.runtime], {
    runtimeContext: { videoClient },
  });

  return {
    videoClient,
    ...renderBase(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <CreateRoomWizard onClose={onClose}>
                <CreateRoomWizard.Step step="details">
                  <CreateRoomWizard.DetailsStep />
                </CreateRoomWizard.Step>
                <CreateRoomWizard.Step step="share">
                  <CreateRoomWizard.ShareStep />
                </CreateRoomWizard.Step>
              </CreateRoomWizard>
            }
          />
          <Route path="/waiting-room/:sessionKey" element={<WaitingRoomProbe />} />
        </Routes>
      </MemoryRouter>,
      { wrapper }
    ),
  };
}

function WaitingRoomProbe() {
  const { sessionKey } = useParams();
  return <span role="status">waiting room {sessionKey}</span>;
}
