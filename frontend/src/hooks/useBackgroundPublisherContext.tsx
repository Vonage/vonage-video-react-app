import { useContext } from 'react';
import { BackgroundPublisherContext } from '../Context/BackgroundPublisherProvider';
import { PreviewPublisherContextType } from '../Context/PreviewPublisherProvider';

/**
 * React hook to access the background replacement publisher context containing selected publisher options.
 * @returns {PreviewPublisherContextType} - The current context value for the Background replacement Publisher Context.
 */
const useBackgroundPublisherContext = (): PreviewPublisherContextType => {
  const context = useContext<PreviewPublisherContextType>(BackgroundPublisherContext);
  return context;
};

export default useBackgroundPublisherContext;
