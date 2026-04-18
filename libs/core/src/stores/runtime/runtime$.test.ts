import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PropsWithChildren } from 'react';

import runtime$ from './runtime$';
import type { Any } from '@common/types';

describe('runtime$ smoke test', () => {
  it('provides default state', () => {
    const wrapper = ({ children }: PropsWithChildren) => {
      return runtime$.Provider({ children, videoClient: {} as Any });
    };

    const { result } = renderHook(() => runtime$.useLanguage(), { wrapper });
    expect(result.current).toBe('en');
  });
});
