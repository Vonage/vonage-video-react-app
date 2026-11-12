import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionKeyClaim } from '@common/constants';
import UsernameInputSkeleton from './UserNameInput.skeleton';

describe('UsernameInputSkeleton', () => {
  it('should render without crashing', () => {
    const { container } = render(<UsernameInputSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('draws the schedule rows only when the sessionKey carries a schedule', () => {
    const scheduledSessionKey = jwt.sign(
      { [SessionKeyClaim.schedule]: { startsAtMs: Date.now(), endsAtMs: Date.now() + 60_000 } },
      'test'
    );
    const unscheduledSessionKey = jwt.sign({ roomName: 'unscheduled' }, 'test');

    const { unmount } = renderAtSessionKey(scheduledSessionKey);
    expect(screen.getByTestId('schedule-countdown-panel-skeleton')).toBeInTheDocument();
    unmount();

    renderAtSessionKey(unscheduledSessionKey);
    expect(screen.queryByTestId('schedule-countdown-panel-skeleton')).not.toBeInTheDocument();
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
