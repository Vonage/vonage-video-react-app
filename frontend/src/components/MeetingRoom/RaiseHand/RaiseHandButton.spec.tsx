import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { raiseHand$ } from '@core/stores';
import useSessionContext from '../../../hooks/useSessionContext';
import { SessionContextType } from '../../../Context/SessionProvider/session';
import { env } from '../../../env';
import RaiseHandButton from './RaiseHandButton';

vi.mock('../../../hooks/useSessionContext');

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const localConnectionId = 'local-connection';

describe('RaiseHandButton', () => {
  const raiseHand = vi.fn();
  const lowerHand = vi.fn();

  beforeEach(() => {
    env.partialUpdate({ ALLOW_RAISE_HAND: true });
    raiseHand.mockReset();
    lowerHand.mockReset();
    mockUseSessionContext.mockReturnValue({
      raiseHand,
      lowerHand,
      vonageVideoClient: { connectionId: localConnectionId },
    } as unknown as SessionContextType);
  });

  afterEach(() => {
    raiseHand$.actions.lowerAllHands();
  });

  it('raises the hand when it is down', () => {
    render(<RaiseHandButton />);

    screen.getByTestId('raise-hand-button').click();

    expect(raiseHand).toHaveBeenCalled();
    expect(lowerHand).not.toHaveBeenCalled();
  });

  it('lowers the hand when it is raised', () => {
    raiseHand$.actions.raiseHand({ connectionId: localConnectionId });
    render(<RaiseHandButton />);

    screen.getByTestId('raise-hand-button').click();

    expect(lowerHand).toHaveBeenCalled();
    expect(raiseHand).not.toHaveBeenCalled();
  });

  it('is not rendered when the feature is disabled', () => {
    env.partialUpdate({ ALLOW_RAISE_HAND: false });

    render(<RaiseHandButton />);

    expect(screen.queryByTestId('raise-hand-button')).not.toBeInTheDocument();
  });
});
