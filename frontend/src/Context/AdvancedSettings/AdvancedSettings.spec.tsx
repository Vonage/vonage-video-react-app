import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';
import advancedSettings$ from './AdvancedSettings';

describe('AdvancedSettingsDialogContext', () => {
  afterEach(() => {
    advancedSettings$.setState((state) => ({ ...state, isOpen: false }));
  });

  it('opens and closes the dialog through context actions', () => {
    const { result } = renderHook(() => advancedSettings$.use.select((state) => state.isOpen));

    expect(result.current).toBe(false);

    act(() => {
      advancedSettings$.use.actions.open();
    });

    expect(result.current).toBe(true);

    act(() => {
      advancedSettings$.use.actions.close();
    });

    expect(result.current).toBe(false);
  });
});
