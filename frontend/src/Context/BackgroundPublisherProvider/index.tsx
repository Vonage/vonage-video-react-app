import { ReactNode, createContext, useMemo } from 'react';
import useBackgroundPublisher from './useBackgroundPublisher';

export type BackgroundPublisherContextType = ReturnType<typeof useBackgroundPublisher>;
export const BackgroundPublisherContext = createContext({} as BackgroundPublisherContextType);

export type BackgroundPublisherProviderProps = {
  children: ReactNode;
};

/**
 * BackgroundPublisherProvider - React Context Provider for PublisherContext
 * PublisherContext contains all state and methods for local video publisher
 * We use Context to make the publisher available in many components across the app without
 * prop drilling: https://react.dev/learn/passing-data-deeply-with-context#use-cases-for-context
 * See useBackgroundPublisher.tsx for methods and state
 * @param {BackgroundPublisherProviderProps} props - The provider properties
 *  @property {ReactNode} children - The content to be rendered
 * @returns {BackgroundPublisherContext} a context provider for a publisher Background
 */
export const BackgroundPublisherProvider = ({ children }: { children: ReactNode }) => {
  const backgroundPublisherContext = useBackgroundPublisher();
  const value = useMemo(() => backgroundPublisherContext, [backgroundPublisherContext]);
  return (
    <BackgroundPublisherContext.Provider value={value}>
      {children}
    </BackgroundPublisherContext.Provider>
  );
};
