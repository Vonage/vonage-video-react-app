/**
 * MovingAvgAudioLevelTrackerFunction
 * @param audioLevel - The audioLevel of the speaker, value between 0 and 1
 *  @returns {object}
 *   @property {number} movingAvg - moving average raw audio level
 *   @property {number} logMovingAvg - moving average mapped to value between 0 and 1
 */
export type MovingAvgAudioLevelTrackerFunction = (audioLevel: number) => {
  movingAvg: number;
  logMovingAvg: number;
};

const DECAY_PER_FRAME = 0.7;
// The SDK samples once per animation frame; decay is scaled to 60 fps so sparse samples decay at the same rate per second.
const REFERENCE_FRAME_DURATION_MS = 1000 / 60;

/**
 * Util factory to create moving average audio level tracker.
 * return a function that can be called with each audio level update and returns the moving average and log
 * moving average values.
 * See for reference: https://developer.vonage.com/en/video/guides/ui-customization/general-customization#adjusting-user-interface-based-on-audio-levels
 * @returns {MovingAvgAudioLevelTrackerFunction}
 */

const createMovingAvgAudioLevelTracker = (): MovingAvgAudioLevelTrackerFunction => {
  let movingAvg = 0;
  let lastUpdateTime: number | null = null;
  return (audioLevel: number) => {
    const now = performance.now();
    const elapsedFrames =
      lastUpdateTime === null ? 1 : (now - lastUpdateTime) / REFERENCE_FRAME_DURATION_MS;
    lastUpdateTime = now;

    if (audioLevel === null || movingAvg <= audioLevel) {
      movingAvg = audioLevel;
    } else {
      const previousAverageWeight = DECAY_PER_FRAME ** elapsedFrames;
      movingAvg = previousAverageWeight * movingAvg + (1 - previousAverageWeight) * audioLevel;
    }
    // 1.5 scaling to map the -30 - 0 dBm range to [0,1]
    const logLevel = Math.log(movingAvg) / Math.LN10 / 1.5 + 1;
    const normalizedLogLevel = Math.min(Math.max(logLevel, 0), 1);
    return {
      movingAvg,
      logMovingAvg: normalizedLogLevel,
    };
  };
};

export default createMovingAvgAudioLevelTracker;
