import type { PropsWithChildren, ReactElement } from 'react';
import { vi } from 'vitest';
import makeGenericProviderWrapper, {
  type GenericWrapperOptions,
} from '@web-test/makeGenericProviderWrapper';
import MiniModeContext, { type MiniModeContextType } from '@Context/MiniMode/MiniModeContext';

type MiniModeTestProviderProps = PropsWithChildren<MiniModeContextType>;

export type MiniModeProviderWrapperOptions = Partial<
  GenericWrapperOptions<typeof MiniModeTestProvider, typeof MiniModeContext>
>;

/**
 * Creates a wrapper that provides a static Mini Mode context value.
 * Mini Mode is closed by default; any field can be overridden via options.
 * @param {MiniModeProviderWrapperOptions} options - The context value overrides.
 * @returns {object} The Mini Mode wrapper and context getter.
 */
function makeMiniModeProviderWrapper(options: MiniModeProviderWrapperOptions = {}) {
  const [wrapper, context] = makeGenericProviderWrapper(MiniModeTestProvider, MiniModeContext, {
    ...makeDefaultMiniModeValue(),
    ...options,
  });

  return {
    wrapper,
    context,
  };
}

function MiniModeTestProvider({ children, ...value }: MiniModeTestProviderProps): ReactElement {
  return <MiniModeContext.Provider value={value}>{children}</MiniModeContext.Provider>;
}

function makeDefaultMiniModeValue(): MiniModeContextType {
  return {
    isAvailable: false,
    isOpen: false,
    hostedElement: null,
    enter: vi.fn(() => Promise.resolve()),
    exit: vi.fn(),
  };
}

export default makeMiniModeProviderWrapper;
