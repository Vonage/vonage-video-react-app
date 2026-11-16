import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionKeyClaim } from '@common/constants';
import UsernameInputSkeleton from './UserNameInput.skeleton';
import { scheduleCountdownPanelSkeletonTestIds } from './components/ScheduleCountdownPanel/ScheduleCountdownPanel.skeleton';

describe('UsernameInputSkeleton', () => {
  it('should render without crashing', () => {
    const { container } = render(<UsernameInputSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('decodes again only when the session key changes', () => {
    expect.assertions(5);
    const sessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';
    const scheduledSessionKey = jwt.sign(
      { sessionId, [SessionKeyClaim.schedule]: { startsAtMs: 1000, endsAtMs: 2000 } },
      'test'
    );
    const unscheduledSessionKey = jwt.sign({ sessionId, roomName: 'unscheduled' }, 'test');
    const decodeBase64 = vi.spyOn(globalThis, 'atob');
    render(
      <MemoryRouter initialEntries={[`/waiting-room/${scheduledSessionKey}`]}>
        <Link to={`/waiting-room/${scheduledSessionKey}?refresh=1`}>Refresh</Link>
        <Link to={`/waiting-room/${unscheduledSessionKey}`}>Change meeting</Link>
        <Routes>
          <Route path="/waiting-room/:roomIdentifier" element={<UsernameInputSkeleton />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByTestId(scheduleCountdownPanelSkeletonTestIds.root)).toBeInTheDocument();
    expect(decodeBase64).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('link', { name: 'Refresh' }));
    expect(decodeBase64).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('link', { name: 'Change meeting' }));
    expect(decodeBase64).toHaveBeenCalledTimes(4);
    expect(
      screen.queryByTestId(scheduleCountdownPanelSkeletonTestIds.root)
    ).not.toBeInTheDocument();
  });

  it('draws the schedule rows only when the sessionKey carries a schedule', () => {
    const sessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';
    const scheduledSessionKey = jwt.sign(
      {
        sessionId,
        [SessionKeyClaim.schedule]: { startsAtMs: Date.now(), endsAtMs: Date.now() + 60_000 },
      },
      'test'
    );
    const unscheduledSessionKey = jwt.sign({ sessionId, roomName: 'unscheduled' }, 'test');

    const { unmount } = renderAtSessionKey(scheduledSessionKey);
    expect(screen.getByTestId(scheduleCountdownPanelSkeletonTestIds.root)).toBeInTheDocument();
    unmount();

    renderAtSessionKey(unscheduledSessionKey);
    expect(
      screen.queryByTestId(scheduleCountdownPanelSkeletonTestIds.root)
    ).not.toBeInTheDocument();
  });
});

function renderAtSessionKey(sessionKey: string) {
  return render(
    <MemoryRouter initialEntries={[`/waiting-room/${sessionKey}`]}>
      <Routes>
        <Route path="/waiting-room/:roomIdentifier" element={<UsernameInputSkeleton />} />
      </Routes>
    </MemoryRouter>
  );
}
