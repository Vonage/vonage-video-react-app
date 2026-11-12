import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import CreateRoomWizard from './index';

describe('CreateRoomWizard', () => {
  it('shows the meeting link, copies it, and closes on Done', async () => {
    expect.assertions(4);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const onClose = vi.fn();

    renderWizard({ onClose });

    const meetingLink = `${window.location.origin}/waiting-room/test-session-key`;
    expect(screen.getByText(meetingLink)).toBeInTheDocument();

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

    await userEvent.click(screen.getByRole('button', { name: 'Copy link' }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Link copied' })).not.toBeInTheDocument();
  });

  it('opens the waiting room of the meeting on Join now', async () => {
    expect.assertions(1);

    renderWizard({ onClose: vi.fn() });

    await userEvent.click(screen.getByRole('button', { name: 'Join now' }));

    expect(screen.getByText('waiting room test-session-key')).toBeInTheDocument();
  });
});

function renderWizard({ onClose }: { onClose: () => void }) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={
            <CreateRoomWizard sessionKey="test-session-key" onClose={onClose}>
              <CreateRoomWizard.Step step="share">
                <CreateRoomWizard.ShareStep />
              </CreateRoomWizard.Step>
            </CreateRoomWizard>
          }
        />
        <Route path="/waiting-room/:sessionKey" element={<WaitingRoomProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

function WaitingRoomProbe() {
  const { sessionKey } = useParams();
  return <span>waiting room {sessionKey}</span>;
}
