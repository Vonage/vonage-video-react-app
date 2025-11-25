import { ReactElement, ReactNode, createContext } from 'react';
import useBackgroundPublisher from './useBackgroundPublisher';

export type BackgroundPublisherContextType = ReturnType<typeof useBackgroundPublisher>;
export const BackgroundPublisherContext = createContext({} as BackgroundPublisherContextType);

export type BackgroundPublisherProviderProps = {
  children: ReactNode;
};

/**
 * BackgroundPublisherProvider - React Context Provider for BackgroundPublisherContext
 * BackgroundPublisherContextType contains all state and methods for local video publisher
 * See useBackgroundPublisher.tsx for methods and state
 * @param {BackgroundPublisherProviderProps} props - Background publisher provider properties
 *  @property {ReactNode} children - The content to be rendered
 * @returns {BackgroundPublisherContext} a context provider for a publisher Background
 */
export const BackgroundPublisherProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const backgroundPublisherContext = useBackgroundPublisher();

  return (
    <BackgroundPublisherContext.Provider value={backgroundPublisherContext}>
      {children}
    </BackgroundPublisherContext.Provider>
  );
};
