import { useContext } from 'react';
import {
  BackgroundPublisherContext,
  BackgroundPublisherContextType,
} from '../Context/BackgroundPublisherProvider';

/**
 * React hook to access the background replacement publisher context containing selected publisher options.
 * @returns {BackgroundPublisherContextType} - The current context value for the Background replacement Publisher Context.
 */
const useBackgroundPublisherContext = (): BackgroundPublisherContextType => {
  const context = useContext<BackgroundPublisherContextType>(BackgroundPublisherContext);
  return context;
};

export default useBackgroundPublisherContext;
