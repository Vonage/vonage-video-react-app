import { ReactElement, ReactNode, createContext } from 'react';
import usePublisher from './usePublisher';
import { PublisherContextInitialValue } from './usePublisher/usePublisher';

export type PublisherContextType = ReturnType<typeof usePublisher>;
export const PublisherContext = createContext({} as PublisherContextType);

export type PublisherProviderProps = {
  children: ReactNode;
  initialValue?: PublisherContextInitialValue;
};

/**
 * PublisherProvider - React Context Provider for PublisherContext
 * PublisherContext contains all state and methods for local video publisher
 * We use Context to make the publisher available in many components across the app without
 * prop drilling: https://react.dev/learn/passing-data-deeply-with-context#use-cases-for-context
 * See usePublisher.tsx for methods and state
 * @param {PublisherProviderProps} props - The provider properties
 * @property {ReactNode} children - The content to be rendered
 * @returns {PublisherContextType} a context provider for a publisher
 */
export const PublisherProvider = ({
  children,
  initialValue,
}: PublisherProviderProps): ReactElement => {
  const publisherContext = usePublisher(initialValue);

  return <PublisherContext.Provider value={publisherContext}>{children}</PublisherContext.Provider>;
};
