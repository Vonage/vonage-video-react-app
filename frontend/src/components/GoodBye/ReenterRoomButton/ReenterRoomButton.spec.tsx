import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { makeTestProvider, providers } from '@test/providers';
import { serverSettings$ } from '@core/stores';
import composeProviders from '@web/helpers/composeProviders';
import ReenterRoomButton from './index';

describe('ReenterRoomButton', () => {
  it('returns to the waiting room with the same session key', async () => {
    expect.assertions(1);
    const { wrapper } = makeTestProvider([providers.runtime], { runtimeContext: undefined });
    render(
      <MemoryRouter initialEntries={['/goodbye/test-room']}>
        <Routes>
          <Route path="/goodbye/:roomIdentifier" element={<ReenterRoomButton />} />
          <Route path="/waiting-room/test-room" element={<p>Waiting room</p>} />
        </Routes>
      </MemoryRouter>,
      { wrapper: composeProviders(wrapper, serverSettings$.Provider) }
    );
    await userEvent.click(screen.getByRole('button', { name: 'Go back to meeting' }));
    expect(screen.getByText('Waiting room')).toBeInTheDocument();
  });
});
