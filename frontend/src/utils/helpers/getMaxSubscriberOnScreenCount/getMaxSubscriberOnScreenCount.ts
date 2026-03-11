import { getBaseLimits, getDeviceType, DeviceTileLimits, DeviceType } from '../../tileLimits';

export type GetMaxSubscriberOnScreenCountProps = {
  isViewingLargeTile: boolean;
  isSharingScreen: boolean;
  pinnedSubscriberCount: number;
  tileLimits?: DeviceTileLimits;
  deviceTypeOverride?: DeviceType;
};

/**
 * Util to get the maximum number of subscribers we should show on screen based on layout mode and device type
 * @param {GetMaxSubscriberOnScreenCountProps} props- function props
 *  @property {boolean} isViewingLargeTile - is there a screenshare of large active speaker tile on screen
 *  @property {boolean} isSharingScreen - whether we are publishing screenshare
 *  @property {boolean} pinnedSubscriberCount - current pinned subscriber count
 * @returns {number} maxSubscriberOnScreenCount - maximum number of subscribers to display
 */
const getMaxSubscriberOnScreenCount = ({
  isViewingLargeTile,
  isSharingScreen,
  pinnedSubscriberCount,
  tileLimits,
  deviceTypeOverride,
}: GetMaxSubscriberOnScreenCountProps): number => {
  const baseLimits = getBaseLimits();
  const deviceType = deviceTypeOverride ?? getDeviceType();
  const fallbackLimits = baseLimits[deviceType];
  const { grid: baseGridLimit, speaker: baseSpeakerLimit } = {
    grid: Math.max(1, tileLimits?.grid ?? fallbackLimits.grid),
    speaker: Math.max(1, tileLimits?.speaker ?? fallbackLimits.speaker),
  };

  if (deviceType === 'mobile') {
    return isViewingLargeTile ? baseSpeakerLimit : baseGridLimit;
  }

  if (!isViewingLargeTile) {
    return baseGridLimit;
  }
  if (isSharingScreen) {
    return Math.max(baseSpeakerLimit - 1, 1);
  }
  if (pinnedSubscriberCount > 1) {
    // As subscribers are moved to the pinned area, we allow for one more subscriber in the non-pinned are to replace it.
    return baseSpeakerLimit + pinnedSubscriberCount - 1;
  }
  return baseSpeakerLimit;
};

export default getMaxSubscriberOnScreenCount;
