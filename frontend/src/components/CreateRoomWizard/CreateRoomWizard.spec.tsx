import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import CreateRoomWizard from './index';
import { testIds as footerTestIds } from './components/CreateRoomWizardFooterActions/CreateRoomWizardFooterActions';
import { testIds as linkCopyTestIds } from './components/ShareStep/components/LinkCopyField/LinkCopyField';

describe('CreateRoomWizard', () => {
  it('shows the meeting link, copies it, and closes on Done', async () => {
    expect.assertions(4);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const onClose = vi.fn();

    renderWizard({ onClose });

    const meetingLink = `${window.location.origin}/waiting-room/test-session-key`;
    expect(screen.getByTestId(linkCopyTestIds.link)).toHaveTextContent(meetingLink);

    await userEvent.click(screen.getByTestId(linkCopyTestIds.copyButton));

    expect(writeText).toHaveBeenCalledWith(meetingLink);
    expect(screen.getByTestId(linkCopyTestIds.copyButton)).toHaveAccessibleName('Link copied');

    await userEvent.click(screen.getByTestId(footerTestIds.doneButton));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not say the link is copied when the clipboard write fails', async () => {
    expect.assertions(2);
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.assign(navigator, { clipboard: { writeText } });
    renderWizard({ onClose: vi.fn() });

    await userEvent.click(screen.getByTestId(linkCopyTestIds.copyButton));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId(linkCopyTestIds.copyButton)).toHaveAccessibleName('Copy link');
  });

  it('opens the waiting room of the meeting on Join now', async () => {
    expect.assertions(1);

    renderWizard({ onClose: vi.fn() });

    await userEvent.click(screen.getByTestId(footerTestIds.joinButton));

    expect(screen.getByRole('status')).toHaveTextContent('waiting room test-session-key');
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
  return <span role="status">waiting room {sessionKey}</span>;
}
