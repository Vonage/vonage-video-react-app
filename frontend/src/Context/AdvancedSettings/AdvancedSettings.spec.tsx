import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import advancedSettings$ from './AdvancedSettings';

describe('AdvancedSettingsDialogContext', () => {
  it('opens and closes the dialog through context actions', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <advancedSettings$.Provider>{children}</advancedSettings$.Provider>
    );

    const { result } = renderHook(() => advancedSettings$.use(), { wrapper });

    expect(result.current[0].isOpen).toBe(false);

    act(() => {
      result.current[1].open();
    });

    expect(result.current[0].isOpen).toBe(true);

    act(() => {
      result.current[1].close();
    });

    expect(result.current[0].isOpen).toBe(false);
  });
});
