import { testIds as wizardDialogTestIds } from './components/CreateRoomWizardDialog/testIds';
import { testIds as scheduleFieldsTestIds } from './components/DetailsStep/components/scheduleFieldsTestIds';
import { testIds as detailsStepTestIds } from './components/DetailsStep/testIds';
import { testIds as meetingNameFieldTestIds } from './components/DetailsStep/components/meetingNameFieldTestIds';
import { testIds as createMeetingButtonTestIds } from './components/CreateMeetingButton/testIds';
import { act, fireEvent, render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeTestProvider, providers } from '@test/providers';
import type { VideoClient } from '@core/services';
import CreateRoomWizard from './index';
import { testIds as footerTestIds } from './components/CreateRoomWizardFooterActions/CreateRoomWizardFooterActions';
import { testIds as linkCopyTestIds } from './components/ShareStep/components/LinkCopyField/LinkCopyField';

vi.mock('../../utils/generateRoomName', () => ({
  __esModule: true,
  default: () => 'mocked-room',
}));

const createSession = vi.fn();
const videoClient = { createSession } as unknown as VideoClient;

describe('CreateRoomWizard', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    createSession.mockResolvedValue({ sessionKey: 'test-session-key' });
  });

  it('creates an unscheduled meeting, shows its link, copies it, and closes on Done', async () => {
    expect.assertions(8);
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    const onClose = vi.fn();

    renderWizard({ onClose });

    expect(screen.getByRole('note')).toHaveTextContent('the link never expires');
    await user.click(screen.getByTestId(createMeetingButtonTestIds.button));
    expect(createSession).toHaveBeenCalledWith({ roomName: 'mocked-room' });
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
    userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValue(new Error('denied'));
    renderWizard({ onClose: vi.fn() });

    await userEvent.click(screen.getByTestId(createMeetingButtonTestIds.button));
    await userEvent.click(await screen.findByTestId(linkCopyTestIds.copyButton));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId(linkCopyTestIds.copyButton)).toHaveAccessibleName('Copy link');
  });

  it('creates a scheduled meeting with the typed name, the next full hour and the chosen duration', async () => {
    expect.assertions(4);
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2030, 0, 15, 9, 20));
    renderWizard({ onClose: vi.fn() });

    await userEvent.type(screen.getByTestId(meetingNameFieldTestIds.input), 'Weekly-Sync');
    await userEvent.click(screen.getByTestId(detailsStepTestIds.scheduleSwitch));
    expect(screen.getByTestId(scheduleFieldsTestIds.duration(60))).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await userEvent.click(screen.getByTestId(scheduleFieldsTestIds.duration(120)));
    await userEvent.click(screen.getByTestId(createMeetingButtonTestIds.button));

    expect(createSession).toHaveBeenCalledWith({
      roomName: 'weekly-sync',
      schedule: { startsAt: new Date(2030, 0, 15, 10, 0).getTime(), durationMinutes: 120 },
    });
    expect(screen.getByTestId(wizardDialogTestIds.dialog)).toHaveTextContent('weekly-sync');
    expect(screen.getByTestId(wizardDialogTestIds.dialog)).toHaveTextContent('2 hours');
    vi.useRealTimers();
  });

  it('opens the waiting room of the new meeting on Join now', async () => {
    expect.assertions(1);
    renderWizard({ onClose: vi.fn() });

    await userEvent.click(screen.getByTestId(createMeetingButtonTestIds.button));
    await userEvent.click(await screen.findByTestId(footerTestIds.joinButton));

    expect(screen.getByRole('status')).toHaveTextContent('waiting room test-session-key');
  });
});

function renderWizard({ onClose }: { onClose: () => void }) {
  const { wrapper } = makeTestProvider([providers.runtime], {
    runtimeContext: { videoClient },
  });

  return renderBase(
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
  );
}

function WaitingRoomProbe() {
  const { sessionKey } = useParams();
  return <span role="status">waiting room {sessionKey}</span>;
}
