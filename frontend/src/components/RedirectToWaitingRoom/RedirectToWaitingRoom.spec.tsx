/* eslint-disable import/first */
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../env', async () => {
  const actual = await vi.importActual<typeof import('../../env')>('../../env');
  const { Env } = actual;

  return {
    ...actual,
    default: new Env({}),
  };
});

import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ReactElement } from 'react';
import env from '../../env';
import RedirectToWaitingRoom from './RedirectToWaitingRoom';

const mockedRoomName = { roomName: 'test-room-name' };

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useParams: () => mockedRoomName,
  };
});

describe('RedirectToWaitingRoom Component', () => {
  const TestComponent = (): ReactElement => <div>TestComponent</div>;

  it('navigates to the waiting room if the user does not have access', () => {
    env.VITE_BYPASS_WAITING_ROOM = false;

    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/room', state: { hasAccess: false } }]}>
        <Routes>
          <Route path="/waiting-room/:roomName" element={<div>In waiting room</div>} />
          <Route
            path="*"
            element={
              <RedirectToWaitingRoom>
                <TestComponent />
              </RedirectToWaitingRoom>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(container.textContent).toBe('In waiting room');
  });

  it('navigates to the waiting room if the user does not have access by setting bypass to false', () => {
    env.VITE_BYPASS_WAITING_ROOM = false;

    const { container } = render(
      <MemoryRouter initialEntries={['/room?bypass=false']}>
        <Routes>
          <Route path="/waiting-room/:roomName" element={<div>In waiting room</div>} />
          <Route
            path="*"
            element={
              <RedirectToWaitingRoom>
                <TestComponent />
              </RedirectToWaitingRoom>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(container.textContent).toBe('In waiting room');
  });

  it('renders the child component if the user set bypass to true', () => {
    env.VITE_BYPASS_WAITING_ROOM = false;

    const { getByText } = render(
      <MemoryRouter initialEntries={['/room?bypass=true']}>
        <RedirectToWaitingRoom>
          <TestComponent />
        </RedirectToWaitingRoom>
      </MemoryRouter>
    );

    expect(getByText('TestComponent')).toBeInTheDocument();
  });

  it('renders the child component if the user set VITE_BYPASS_WAITING_ROOM to true', () => {
    env.VITE_BYPASS_WAITING_ROOM = true;

    const { getByText } = render(
      <MemoryRouter initialEntries={['/room']}>
        <RedirectToWaitingRoom>
          <TestComponent />
        </RedirectToWaitingRoom>
      </MemoryRouter>
    );

    expect(getByText('TestComponent')).toBeInTheDocument();
  });

  it('renders the child component if the user has access', () => {
    env.VITE_BYPASS_WAITING_ROOM = false;

    const { getByText } = render(
      <MemoryRouter initialEntries={[{ pathname: '/room', state: { hasAccess: true } }]}>
        <RedirectToWaitingRoom>
          <TestComponent />
        </RedirectToWaitingRoom>
      </MemoryRouter>
    );

    expect(getByText('TestComponent')).toBeInTheDocument();
  });
});
