import { ReactElement, ReactNode, createContext } from 'react';
import useLoggerContext from './useLoggerContext';

export type LoggerContextType = ReturnType<typeof useLoggerContext>;
export const LoggerContext = createContext({} as LoggerContextType);

export type LoggerProviderProps = {
  children: ReactNode;
};

/**
 * LoggerProvider - React Context Provider for LoggerContext
 * Automatically syncs userId, sessionId, and connectionId into the logger
 * by reading from UserContext and SessionContext.
 * See useLoggerContext.tsx for the derived values and side effects.
 * @param {LoggerProviderProps} props - The provider properties
 * @returns a context provider for the logger context
 */
const LoggerProvider = ({ children }: LoggerProviderProps): ReactElement => {
  const loggerContext = useLoggerContext();

  return <LoggerContext.Provider value={loggerContext}>{children}</LoggerContext.Provider>;
};

export default LoggerProvider;
