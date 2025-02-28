import OpenTokLayoutManager, { Box, Element, LayoutContainer } from 'opentok-layout-js';

// Opentok element methods videoHeight() and videoWidth() can return undefined so
// this util type helps keep an array of Elements with those fields possible undefined
export type MaybeElement = {
  big: boolean;
  height: number | undefined;
  width: number | undefined;
  fixedRatio?: boolean;
};
/**
 * Class to handle config options and interaction with layout manager from opentok-layout-js
 * @class LayoutManager
 */
class LayoutManager {
  manager?: LayoutContainer;

  init(
    containerDimensions: { height: number; width: number },
    fixLargeTilesLandscape: boolean = false
  ) {
    // Layout options see: https://github.com/aullman/opentok-layout-js?tab=readme-ov-file#usage
    this.manager = OpenTokLayoutManager({
      fixedRatio: false,
      alignItems: 'center',
      bigPercentage: 0.8,
      bigFixedRatio: false,
      bigAlignItems: 'center',
      bigScaleLastRow: false,
      smallAlignItems: 'center',
      scaleLastRow: true,
      maxRatio: 9 / 16,
      maxWidth: Infinity,
      maxHeight: Infinity,
      smallMaxWidth: Infinity,
      smallMaxHeight: Infinity,
      bigMaxWidth: Infinity,
      bigMaxHeight: Infinity,
      bigMaxRatio: fixLargeTilesLandscape ? 9 / 16 : 3 / 2,
      bigMinRatio: 9 / 16,
      bigFirst: true,
      containerWidth: containerDimensions.width,
      containerHeight: containerDimensions.height,
    });
  }
  getLayout(
    containerDimensions: { height: number; width: number },
    boxes: Element[],
    fixLargeTilesLandscape: boolean
  ): Box[] {
    this.init(containerDimensions, fixLargeTilesLandscape);
    // Currently the layout manager doesn't support updating dimensions on the fly so we must re-create the manager every time
    // https://github.com/aullman/opentok-layout-js/issues/141
    return this.manager?.getLayout(boxes)?.boxes ?? [];
  }
}
export default LayoutManager;
