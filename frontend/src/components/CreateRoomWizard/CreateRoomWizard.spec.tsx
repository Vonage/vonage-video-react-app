import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeTestProvider, providers } from '@test/providers';
import type { VideoClient } from '@core/services';
import CreateRoomWizard from './index';

vi.mock('../../utils/generateRoomName', () => ({
  __esModule: true,
  default: () => 'mocked-room',
}));

const createSession = vi.fn();
const videoClient = { createSession } as unknown as VideoClient;

describe('CreateRoomWizard', () => {
  beforeEach(() => {
    createSession.mockResolvedValue({ sessionKey: 'test-session-key' });
  });

  it('creates an unscheduled meeting, shows its link, copies it, and closes on Done', async () => {
    expect.assertions(6);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const onClose = vi.fn();
    renderWizard({ onClose });

    expect(screen.getByRole('note')).toHaveTextContent('the link never expires');
    await userEvent.click(screen.getByRole('button', { name: 'Create meeting' }));

    const meetingLink = `${window.location.origin}/waiting-room/test-session-key`;
    expect(createSession).toHaveBeenCalledWith({ roomName: 'mocked-room' });
    expect(await screen.findByText(meetingLink)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(writeText).toHaveBeenCalledWith(meetingLink);
    expect(screen.getByRole('button', { name: 'Link copied' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not say the link is copied when the clipboard write fails', async () => {
    expect.assertions(2);
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.assign(navigator, { clipboard: { writeText } });
    renderWizard({ onClose: vi.fn() });

    await userEvent.click(screen.getByRole('button', { name: 'Create meeting' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Copy link' }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Link copied' })).not.toBeInTheDocument();
  });

  it('creates a scheduled meeting with the typed name, the next full hour and the chosen duration', async () => {
    expect.assertions(4);
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2030, 0, 15, 9, 20));
    renderWizard({ onClose: vi.fn() });

    await userEvent.type(screen.getByLabelText('Meeting name (optional)'), 'Weekly-Sync');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Set a date and time' }));
    expect(screen.getByRole('button', { name: '1 hour' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: '2 hours' }));
    await userEvent.click(screen.getByRole('button', { name: 'Create meeting' }));

    expect(createSession).toHaveBeenCalledWith({
      roomName: 'weekly-sync',
      schedule: { startsAt: new Date(2030, 0, 15, 10, 0).getTime(), durationMinutes: 120 },
    });
    expect(await screen.findByText('weekly-sync')).toBeInTheDocument();
    expect(screen.getByText(/2 hours/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('opens the waiting room of the new meeting on Join now', async () => {
    expect.assertions(1);
    renderWizard({ onClose: vi.fn() });

    await userEvent.click(screen.getByRole('button', { name: 'Create meeting' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Join now' }));

    expect(screen.getByText('waiting room test-session-key')).toBeInTheDocument();
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
  return <span>waiting room {sessionKey}</span>;
}
