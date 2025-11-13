import { useRef } from 'react';
import LayoutManager from '../utils/layoutManager';

export type GetLayout = InstanceType<typeof LayoutManager>['getLayout'];
/**
 * React hook to return a getLayout function as defined here:
 * https://github.com/aullman/opentok-layout-js?tab=readme-ov-file#usage
 * getLayout takes an array of Element objects and returns an array of Box objects
 * which specify exact size and position of video tiles
 * @returns {GetLayout} getLayout
 */
const useLayoutManager = (): GetLayout => {
  const layoutManager = useRef(new LayoutManager());
  // eslint-disable-next-line react-hooks/refs
  return layoutManager.current.getLayout.bind(layoutManager.current);
};

export default useLayoutManager;
