import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import advancedSettingsDialog$ from './AdvancedSettingsDialogContext';

describe('AdvancedSettingsDialogContext', () => {
  it('opens and closes the dialog through context actions', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <advancedSettingsDialog$.Provider>{children}</advancedSettingsDialog$.Provider>
    );

    const { result } = renderHook(() => advancedSettingsDialog$.use(), { wrapper });

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
