import { describe, expect, it, vi, beforeEach } from 'vitest';
import handleCaptionsSignal from './handleCaptionsSignal';
import { SignalEvent } from '../../types/session';

vi.mock('../../api/captions', () => ({
  disableCaptions: vi.fn(),
}));
const mockCaptionsId = '12345';

describe('handleCaptionsSignal', () => {
  const mockSetIsCaptioningEnabled = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should enable captions', () => {
    const event = {
      data: JSON.stringify({
        action: 'enable',
        captionsId: mockCaptionsId,
      }),
    } as unknown as SignalEvent;

    handleCaptionsSignal({
      event,
      setIsCaptioningEnabled: mockSetIsCaptioningEnabled,
    });
    expect(mockSetIsCaptioningEnabled).toHaveBeenCalledWith(true);
  });

  it('should disable captions', () => {
    const event = {
      data: JSON.stringify({
        action: 'disable',
      }),
    } as unknown as SignalEvent;

    handleCaptionsSignal({
      event,
      setIsCaptioningEnabled: mockSetIsCaptioningEnabled,
    });
    expect(mockSetIsCaptioningEnabled).toHaveBeenCalledWith(false);
  });

  it('should warn for unknown actions', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const event = {
      data: JSON.stringify({
        action: 'unknown-action',
      }),
    } as unknown as SignalEvent;

    handleCaptionsSignal({
      event,
      setIsCaptioningEnabled: mockSetIsCaptioningEnabled,
    });

    expect(mockSetIsCaptioningEnabled).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown captions action: unknown-action');
  });
});
