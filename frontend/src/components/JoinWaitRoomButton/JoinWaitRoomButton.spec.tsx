import { render as renderBase, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import MemoryRouter from '@test/RouterWrapper';
import { describe, expect, it, Mock, vi, beforeEach } from 'vitest';
import { makeTestProvider, providers } from '@test/providers';
import type { VideoClient } from '@core/services';
import JoinWaitRoomButton from './JoinWaitRoomButton';

const mockMutate = vi.fn();

const mockVideoClient = {
  createSession: (...args: unknown[]): unknown => mockMutate(...args),
} as unknown as VideoClient;

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useNavigate: vi.fn(),
  };
});

const mockNavigate = vi.fn();
const mockSetHasError = vi.fn();

describe('JoinWaitRoomButtonComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate.mockResolvedValue({ sessionKey: 'resolved-session-key' });
  });

  it('should navigate to the waiting room if the room name is valid', async () => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    render(
      <MemoryRouter>
        <JoinWaitRoomButton roomName="test-room" isDisabled={false} setHasError={mockSetHasError} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/waiting-room/resolved-session-key');
    });
  });

  it('should not navigate and set error if the room name is empty', () => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    render(
      <MemoryRouter>
        <JoinWaitRoomButton roomName="" isDisabled={false} setHasError={mockSetHasError} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetHasError).toHaveBeenCalledWith(true);
  });
});

function render(ui: React.ReactElement) {
  const { wrapper } = makeTestProvider([providers.runtime], {
    runtimeContext: { videoClient: mockVideoClient },
  });
  return renderBase(ui, { wrapper });
}
