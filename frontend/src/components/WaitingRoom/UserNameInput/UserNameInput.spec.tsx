import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { makeTestProvider, providers } from '@test/providers';
import UsernameInput from './UserNameInput';

const sessionKeyWithoutRoomName =
  'eyJhbGciOiJIUzI1NiJ9.eyJzZXNzaW9uSWQiOiJzZXNzaW9uLTEifQ.signature';

const MeetingRoomMarker = () => {
  const { roomIdentifier } = useParams();

  return <div>meeting room {roomIdentifier}</div>;
};

describe('UsernameInput', () => {
  it('navigates to the meeting room with the sessionKey when the key carries no room name', async () => {
    const { wrapper: Wrapper } = makeTestProvider([providers.user]);

    render(
      <Wrapper>
        <MemoryRouter initialEntries={[`/waiting-room/${sessionKeyWithoutRoomName}`]}>
          <Routes>
            <Route
              path="/waiting-room/:roomIdentifier"
              element={<UsernameInput roomName="" username="Anonymous" setUsername={vi.fn()} />}
            />
            <Route path="/room/:roomIdentifier" element={<MeetingRoomMarker />} />
          </Routes>
        </MemoryRouter>
      </Wrapper>
    );

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText(`meeting room ${sessionKeyWithoutRoomName}`)).toBeInTheDocument();
  });
});
